# AGENTS.md

The public identity broker at `https://login.samebase.com`: a Cloudflare Worker that runs
`@samebase/identity-broker` with Google, GitHub and the Client ID Metadata Document layer. See
README.md.

- `src/broker.ts` is the Worker: `identityBroker` of the package with `DurableObjectStore`, the
  connectors `google` and `github`, and `Registration.clientIdMetadataDocuments()` for any host.
- `src/limit.ts` is the one piece of logic of this repository: the limit for each caller on
  `/authorize`, with the Workers rate limiting binding. Its tests are `src/limit.test.ts`. Do not
  add tests that repeat the package's own tests.
- `alchemy.run.ts` has one stage, `prod`. The state is in the team's Convex store, under the stack
  name of the repository. `.github/workflows/alchemy.yml` deploys it on a push to `main`. There are
  no pull request previews: a provider accepts only the exact callback address.
- The Worker's name, `public-identity-broker`, and the package's Durable Object names are the
  address of all the broker's data. Do not rename them.
- The secrets `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_GITHUB_CLIENT_ID`,
  `AUTH_GITHUB_CLIENT_SECRET`, `IDENTITY_BROKER_KEYS` and `IDENTITY_BROKER_MODERATION_KEY` reach the
  Worker from the deploying shell's variables of those names. Never put a value in a file of this
  repository or in a log.
- Never use the U+2014 em dash character. No `any`, no type assertions except `as const`.
- `pnpm install`, then `pnpm run check`.
