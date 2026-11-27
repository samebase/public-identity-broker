import { Effect } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

const REPOSITORY = "https://github.com/samebase/public-identity-broker";

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>login.samebase.com</title>
<meta name="description" content="Google and GitHub sign-in for any site, with no registration and no client secret.">
<style>
  :root { color-scheme: light dark; --fg: #18181b; --muted: #71717a; --bg: #fafafa;
    --line: #e4e4e7; --code: #f4f4f5; --slate: #394447; --slate-fg: #fff; }
  @media (prefers-color-scheme: dark) {
    :root { --fg: #fafafa; --muted: #a1a1aa; --bg: #09090b; --line: #27272a; --code: #18181b;
      --slate: #fafafa; --slate-fg: #18181b; }
  }
  body { margin: 0; color: var(--fg); background: var(--bg);
    font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
  .frame { width: calc(100% - 2rem); max-width: 42rem; margin: 0 auto; padding: 4rem 0 2rem; }
  h1 { margin: 0; font-size: clamp(1.75rem, 5vw, 2.25rem); line-height: 1.15; font-weight: 700;
    letter-spacing: -0.03em; }
  .lead { margin: 1rem 0 0; color: var(--muted); font-size: 1.0625rem; }
  .cta { display: flex; flex-wrap: wrap; gap: 1.25rem; align-items: center; margin-top: 1.75rem; }
  .button { display: inline-flex; align-items: center; min-height: 2.5rem; padding: 0 1.125rem;
    color: var(--slate-fg); background: var(--slate); font-size: 0.9375rem; font-weight: 600;
    text-decoration: none; }
  h2 { margin: 3.5rem 0 0; font-size: 1.0625rem; font-weight: 600; }
  p { margin: 0.5rem 0 0; }
  .muted { color: var(--muted); }
  code { font: 0.875em/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  pre { margin: 1rem 0 0; padding: 1rem 1.125rem; overflow-x: auto; background: var(--code);
    border: 1px solid var(--line); font-size: 0.875rem; line-height: 1.6; }
  pre code { font-size: inherit; }
  dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 0.5rem 1.5rem;
    margin: 1rem 0 0; }
  dt { color: var(--muted); }
  dd { margin: 0; overflow-wrap: anywhere; }
  a { color: inherit; text-underline-offset: 0.2em; text-decoration-thickness: 1px; }
  a:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
  footer { display: flex; gap: 1rem; margin-top: 4rem; padding-top: 1rem;
    border-top: 1px solid var(--line); font-size: 0.8125rem; }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--fg); }
  footer .samebase { margin-left: auto; }
  @media (max-width: 480px) { .frame { padding-top: 2.5rem; } dl { grid-template-columns: 1fr; gap: 0 0; } dd { margin-bottom: 0.5rem; } }
</style>
</head>
<body><div class="frame">
<h1>Google and GitHub sign-in for any site</h1>
<p class="lead">No registration and no client secret. Serve one JSON file on your site, then point any OpenID Connect library at <code>https://login.samebase.com</code>.</p>
<div class="cta">
<a class="button" href="${REPOSITORY}#add-sign-in-to-your-site">Read the guide</a>
<a href="${REPOSITORY}">Source on GitHub</a>
</div>

<h2>1. Serve this file over https</h2>
<p class="muted">Its URL is your client id. Each redirect URI is on the same origin.</p>
<pre><code>{
  "client_id": "https://app.example.com/oauth-client.json",
  "client_name": "My app",
  "redirect_uris": ["https://app.example.com/auth/callback"],
  "token_endpoint_auth_methods_supported": ["none"]
}</code></pre>

<h2>2. Set your OpenID Connect library</h2>
<dl>
<dt>Issuer</dt><dd><code>https://login.samebase.com</code></dd>
<dt>Client id</dt><dd>The URL of your file</dd>
<dt>Secret</dt><dd>None; code flow with PKCE (S256)</dd>
<dt>Scope</dt><dd><code>openid email profile</code></dd>
</dl>
<p class="muted">Your site gets an <code>id_token</code> whose <code>sub</code> is <code>google:&lt;id&gt;</code> or <code>github:&lt;id&gt;</code>. Your users stay in your app.</p>

<footer>
<a href="https://samebase.com/privacy">Privacy</a>
<a href="https://samebase.com/terms">Terms</a>
<a href="https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/">The standard</a>
<a class="samebase" href="https://samebase.com">Samebase</a>
</footer>
</div></body>
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
