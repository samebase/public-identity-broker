import { Effect } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

const REPOSITORY = "https://github.com/samebase/public-identity-broker";

// The look of the package's sign-in page, so the two pages of this host read as one service.
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>login.samebase.com</title>
<meta name="description" content="Google and GitHub sign-in for any site, with no registration and no client secret.">
<style>
  :root { color-scheme: light dark; --fg: #18181b; --muted: #71717a; --bg: #f4f4f5; --card: #fff;
    --line: #e4e4e7; --code: #f4f4f5; }
  @media (prefers-color-scheme: dark) {
    :root { --fg: #fafafa; --muted: #a1a1aa; --bg: #09090b; --card: #18181b; --line: #27272a;
      --code: #09090b; }
  }
  body { margin: 0; color: var(--fg); background: var(--bg);
    font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  .frame { width: calc(100% - 2rem); max-width: 45rem; margin: 3rem auto 1.5rem; }
  main { box-sizing: border-box; padding: 2rem 1.75rem; background: var(--card);
    border: 1px solid var(--line); border-radius: 16px; }
  h1 { margin: 0; font-size: 1.5rem; line-height: 1.3; font-weight: 600; letter-spacing: -0.01em; }
  .lead { margin: 0.5rem 0 0; color: var(--muted); }
  h2 { margin: 2rem 0 0.5rem; font-size: 1rem; font-weight: 600; }
  p, ul { margin: 0.5rem 0 0; }
  ul { padding-left: 1.25rem; }
  li { margin-top: 0.25rem; }
  code { font: 0.875em/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { margin: 0.75rem 0 0; padding: 0.875rem 1rem; overflow-x: auto; background: var(--code);
    border: 1px solid var(--line); border-radius: 8px; }
  a { color: inherit; text-underline-offset: 0.2em; text-decoration-thickness: 1px; }
  a:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
  .links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; margin-top: 2rem; padding-top: 1rem;
    border-top: 1px solid var(--line); font-size: 0.875rem; }
  .below { display: flex; gap: 1rem; align-items: center; margin-top: 0.75rem; padding: 0 8px;
    font-size: 0.75rem; }
  .below a { padding: 0.25rem 0; color: var(--muted); text-decoration: none; }
  .below a:hover { color: var(--fg); }
  .attribution { margin-left: auto; }
  .attribution svg { width: 0.75em; height: 0.75em; margin-right: 0.15em; vertical-align: baseline; }
</style>
</head>
<body><div class="frame"><main>
<h1>login.samebase.com</h1>
<p class="lead">Google and GitHub sign-in for any site. No registration, no client secret.</p>
<h2>1. Serve a file on your site</h2>
<p>Its address is your client id.</p>
<pre><code>// https://app.example.com/oauth-client.json
{
  "client_id": "https://app.example.com/oauth-client.json",
  "client_name": "My app",
  "redirect_uris": ["https://app.example.com/auth/callback"],
  "token_endpoint_auth_methods_supported": ["none"]
}</code></pre>
<h2>2. Point your OpenID Connect library here</h2>
<ul>
<li>Issuer: <code>https://login.samebase.com</code></li>
<li>Client id: the address of the file</li>
<li>No client secret; code flow with PKCE (S256)</li>
<li>Scope: <code>openid email profile</code></li>
</ul>
<p>Your site gets an <code>id_token</code> whose <code>sub</code> is <code>google:&lt;id&gt;</code> or <code>github:&lt;id&gt;</code>. Your users stay in your app.</p>
<div class="links">
<a href="${REPOSITORY}#add-sign-in-to-your-site">Guide and source</a>
<a href="/.well-known/openid-configuration">Discovery</a>
<a href="https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/">The standard</a>
</div>
</main><div class="below"><a href="https://samebase.com/privacy">Privacy</a><a href="https://samebase.com/terms">Terms</a><a class="attribution" href="https://samebase.com"><svg viewBox="0 0 60 60" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h60v60H0z M20 20h20v20H20z" fill="currentColor" fill-rule="evenodd"/></svg>Samebase</a></div></div></body>
</html>
`;

/** The broker with a page at `/` that says what this host is, for a person who opens it. */
export const withHome = <E, R>(fetch: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    if (
      request.url.split("?", 1)[0] !== "/" ||
      (request.method !== "GET" && request.method !== "HEAD")
    ) {
      return yield* fetch;
    }
    return HttpServerResponse.text(request.method === "HEAD" ? "" : page, {
      contentType: "text/html; charset=utf-8",
      headers: { "cache-control": "public, max-age=3600" },
    });
  });
