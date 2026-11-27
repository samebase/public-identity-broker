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
    --line: #e4e4e7; --slate: #394447; --slate-fg: #fff; }
  @media (prefers-color-scheme: dark) {
    :root { --fg: #fafafa; --muted: #a1a1aa; --bg: #09090b; --line: #27272a;
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
  a { color: inherit; text-underline-offset: 0.2em; text-decoration-thickness: 1px; }
  a:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
  footer { display: flex; gap: 1rem; margin-top: 4rem; padding-top: 1rem;
    border-top: 1px solid var(--line); font-size: 0.8125rem; }
  footer a { color: var(--muted); text-decoration: none; }
  footer a:hover { color: var(--fg); }
  footer .samebase { margin-left: auto; }
  @media (max-width: 480px) { .frame { padding-top: 2.5rem; } }
</style>
</head>
<body><div class="frame">
<h1>Google and GitHub sign-in for any site</h1>
<p class="lead">An OpenID Connect provider that implements <a href="https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/">OAuth Client ID Metadata Documents</a>: your site's client id is the URL of a JSON file on your site. No registration, no client secret.</p>
<div class="cta">
<a class="button" href="${REPOSITORY}#add-sign-in-to-your-site">Read the guide</a>
<a href="${REPOSITORY}">Source on GitHub</a>
</div>

<footer>
<a href="https://samebase.com/privacy">Privacy</a>
<a href="https://samebase.com/terms">Terms</a>
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
