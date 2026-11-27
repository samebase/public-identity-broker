# public-identity-broker

Google sign-in for any site, with no registration and no client secret. The broker runs at
`https://login.samebase.com`. A site's `client_id` is the address of a small JSON file on the site's
own host
([OAuth Client ID Metadata Document](https://www.ietf.org/archive/id/draft-ietf-oauth-client-id-metadata-document-03.html)).
The broker keeps no user accounts: the site gets a standard OpenID Connect `id_token` and owns its
users.

The broker is [`@samebase/identity-broker`](https://www.npmjs.com/package/@samebase/identity-broker)
with its CIMD layer, on a Cloudflare Worker, plus the settings of this repository. It is a shared
service under [Samebase's terms](https://samebase.com/terms).

## Add sign-in to your site

1. Serve this file at an https address on your site, such as
   `https://app.example.com/oauth-client.json`:

   ```json
   {
     "client_id": "https://app.example.com/oauth-client.json",
     "client_name": "My app",
     "redirect_uris": ["https://app.example.com/auth/callback"],
     "token_endpoint_auth_methods_supported": ["none"]
   }
   ```

   `client_id` is the file's address, character for character, with no query and no port. Each
   return address is https on the same origin as the file.

2. Set your OpenID Connect library to:
   - issuer `https://login.samebase.com`
   - `client_id`: the file's address
   - no client secret (a public client)
   - the code flow with PKCE (S256), scope `openid email profile`

With [`openid-client`](https://github.com/panva/openid-client):

```ts
import * as client from "openid-client";

const config = await client.discovery(
  new URL("https://login.samebase.com"),
  "https://app.example.com/oauth-client.json",
  undefined,
  client.None(),
);

// Sign in: keep the three values in the user's session, then send the browser to `url`.
const codeVerifier = client.randomPKCECodeVerifier();
const state = client.randomState();
const nonce = client.randomNonce();
const url = client.buildAuthorizationUrl(config, {
  redirect_uri: "https://app.example.com/auth/callback",
  scope: "openid email profile",
  code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
  code_challenge_method: "S256",
  state,
  nonce,
});

// The callback: `currentUrl` is the URL that the browser came back to.
const tokens = await client.authorizationCodeGrant(config, currentUrl, {
  pkceCodeVerifier: codeVerifier,
  expectedState: state,
  expectedNonce: nonce,
});
const { sub, email, name } = tokens.claims() ?? {};
```

`sub` is `google:<Google's id of the user>`, the same at every broker of this package. The user sees
the broker's page with your site's host before Google. The broker reads your file at the first
sign-in, and again after its `Cache-Control: max-age` (1 hour without one, at most 24 hours). The
package README has the
[full rules](https://github.com/samebase/samebase/blob/main/packages/identity-broker/README.md#sign-in-with-a-client-id-metadata-document).

## Operate

`.github/workflows/alchemy.yml` deploys the stack of `alchemy.run.ts`, one stage `prod`, on each
push to `main`, or by hand with **Actions**, **alchemy**, **Run workflow**. Saving a secret does not
start a run. The state is in the team's Convex store, under the stack name `<owner>/<repository>`.
Pull requests get no preview deploy: Google accepts only the exact callback address.

The repository settings (**Settings**, **Secrets and variables**, **Actions**):

| Name                    | Kind     | Value                                                                                                                                                                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONVEX_ACCESS_TOKEN`   | secret   | A Convex team access token of the team that holds `alchemy-state-store`.                                                                                                                                               |
| `CLOUDFLARE_API_TOKEN`  | secret   | A Cloudflare account token: Workers Scripts Write and Account Settings Read on the account, and Workers Routes Write, DNS Write and Zone Read on the zone `samebase.com`.                                              |
| `CLOUDFLARE_ACCOUNT_ID` | variable | The account that holds the zone `samebase.com`.                                                                                                                                                                        |
| `GOOGLE_CLIENT_ID`      | secret   | A Web application client in the Google Auth Platform, with the redirect URI `https://login.samebase.com/connectors/google/callback`.                                                                                   |
| `GOOGLE_CLIENT_SECRET`  | secret   | That client's secret.                                                                                                                                                                                                  |
| `IDENTITY_BROKER_KEYS`  | secret   | The signing keys: the key set that the package README's [command](https://github.com/samebase/samebase/blob/main/packages/identity-broker/README.md#environment-variables) prints. Keep a copy: GitHub cannot show it. |

### Rotate the signing keys

Make a new key set with the command. To keep the tokens of the last minutes valid, add the old
current key to its `keys` as
`{ "kid": <old kid>, "status": "retired", "retiredAt": <now, in ms>, "publicJwk": <the old privateJwk without d, p, q, dp, dq and qi> }`.
Set the secret and run the workflow. The JWKS keeps a retired key for 14 days; drop it at the next
rotation. A set with no retired key works too: only the tokens issued in the last minutes stop
verifying.

### Limits

- **For each caller:** 30 requests to `/authorize` a minute for each IPv4 address or IPv6 /64
  network (`CF-Connecting-IP`). A request over the limit gets 429 with `Retry-After: 60`. The
  counters are Cloudflare's Workers rate limiting binding: they are kept for each Cloudflare
  location and are approximate. Each `/authorize` request can read a site's file and store a client.
- **For the whole broker** (the package's defaults): 120 reads of files a minute and 30 new clients
  an hour. More get 429.

### What the broker stores, and for how long

- No user accounts, no sessions, no passwords. Each sign-in goes to Google again.
- In its Durable Object: a card of each site's file, kept 24 hours after its last good read, or 14
  days after its last sign-in; and short-lived sign-in records (a sign-in lives 10 minutes, an
  access token 5). A daily cleanup removes the expired rows.
- Workers Logs: one JSON line for each event, with no invocation logs, because a callback address
  carries Google's code.
- Alchemy keeps the Worker's secrets in the state store, sealed (AES-256-GCM). A holder of the team
  token can read them: treat `CONVEX_ACCESS_TOKEN` and `CLOUDFLARE_API_TOKEN` as administrator
  credentials.

The Worker's name `public-identity-broker` is the address of all the broker's data: a new name
starts with empty storage.

### Upgrade

Renovate opens a pull request when a new broker or Alchemy version is out. Read the
[broker's changelog](https://github.com/samebase/samebase/blob/main/packages/identity-broker/CHANGELOG.md)
before you merge.

Report a vulnerability in private: see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE).
