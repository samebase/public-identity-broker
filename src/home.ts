import { Effect } from "effect";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

const REPOSITORY = "https://github.com/samebase/public-identity-broker";

// Combines Samebase typography, square geometry, and slate actions with the broker's neutral theme.
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>login.samebase.com</title>
<meta name="description" content="Google and GitHub sign-in for any site, with no registration and no client secret.">
<style>
  :root {
    color-scheme: light dark;
    --bg: #f4f4f5;
    --card: #ffffff;
    --surface: #fafafa;
    --fg: #18181b;
    --muted: #52525b;
    --subtle: #71717a;
    --line: #e4e4e7;
    --line-strong: #d4d4d8;
    --slate: #394447;
    --slate-hover: #2c3538;
    --slate-fg: #ffffff;
    --code-key: #18181b;
    --code-str: #255059;
    --code-punct: #71717a;
    --spec-card: #ffffff;
    --spec-btn-bg: #ffffff;
    --spec-btn-line: #747775;
    --spec-btn-fg: #1f1f1f;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --card: #141517;
      --surface: #0d0e10;
      --fg: #fafafa;
      --muted: #a1a1aa;
      --subtle: #8b8b94;
      --line: #27272a;
      --line-strong: #3f3f46;
      --slate: #fafafa;
      --slate-hover: #e4e4e7;
      --slate-fg: #18181b;
      --code-key: #fafafa;
      --code-str: #9bc4cc;
      --code-punct: #71717a;
      --spec-card: #18181b;
      --spec-btn-bg: #131314;
      --spec-btn-line: #8e918f;
      --spec-btn-fg: #e3e3e3;
    }
  }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    color: var(--fg);
    background: var(--bg);
    font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::selection { color: var(--card); background: var(--fg); }
  a { color: inherit; text-underline-offset: 0.22em; text-decoration-thickness: 1px; }
  a:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
  code { font: 0.875em/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

  .frame {
    width: calc(100% - 2rem);
    max-width: 52rem;
    margin: 2rem auto 1.75rem;
  }
  main {
    background: var(--card);
    border: 1px solid var(--line);
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    padding: 0.875rem 2rem;
    border-bottom: 1px solid var(--line);
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .brand svg { width: 1.05em; height: 1.05em; flex: none; color: var(--slate); }
  .proto {
    font: 0.75rem/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: var(--muted);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.85fr);
    gap: 2rem;
    align-items: center;
    padding: 1.875rem 2rem;
    border-bottom: 1px solid var(--line);
  }
  h1 {
    margin: 0;
    font-size: clamp(1.625rem, 3.2vw, 2.25rem);
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -0.03em;
  }
  .lead {
    margin: 0.875rem 0 0;
    max-width: 34rem;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1.5;
  }
  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    margin-top: 1.375rem;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0 1.125rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
    transition: background-color 0.12s ease, border-color 0.12s ease;
  }
  .btn-primary {
    color: var(--slate-fg);
    background: var(--slate);
    border-color: var(--slate);
  }
  .btn-primary:hover {
    background: var(--slate-hover);
    border-color: var(--slate-hover);
  }
  .btn-secondary {
    color: var(--fg);
    background: var(--card);
    border-color: var(--line-strong);
  }
  .btn-secondary:hover {
    background: var(--surface);
    border-color: var(--fg);
  }

  .specimen-stage {
    padding: 1.125rem;
    background: var(--bg);
    border: 1px solid var(--line);
    user-select: none;
    pointer-events: none;
  }
  .specimen {
    padding: 1.125rem 1rem 1rem;
    background: var(--spec-card);
    border: 1px solid var(--line);
    border-radius: 12px;
  }
  .specimen-title {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
  }
  .specimen-title strong {
    display: block;
    font-weight: 600;
  }
  .specimen-actions {
    display: grid;
    gap: 0.4375rem;
    margin-top: 0.875rem;
  }
  .specimen-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.125rem;
    padding: 0 0.75rem;
    color: var(--spec-btn-fg);
    background: var(--spec-btn-bg);
    border: 1px solid var(--spec-btn-line);
    border-radius: 999px;
    font-size: 0.8125rem;
    font-weight: 500;
  }
  .specimen-btn svg { width: 14px; height: 14px; flex: none; }

  .steps {
    display: grid;
  }
  .step {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--line);
    min-width: 0;
  }
  .step-head {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 1.375rem;
    height: 1.375rem;
    margin-top: 0.0625rem;
    background: var(--slate);
    color: var(--slate-fg);
    font: 700 0.75rem/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  h2 {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.35;
    font-weight: 700;
    letter-spacing: -0.015em;
  }
  .step-note {
    margin: 0.5rem 0 0;
    color: var(--muted);
  }

  .code-panel {
    margin-top: 0.875rem;
    border: 1px solid var(--line);
    background: var(--surface);
    min-width: 0;
  }
  .code-bar {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--line);
    font: 0.75rem/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: var(--muted);
    overflow-wrap: anywhere;
  }
  pre {
    margin: 0;
    padding: 0.875rem 1rem;
    overflow-x: auto;
    max-width: 100%;
    font: 0.8125rem/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  pre code { font: inherit; }
  .ck { color: var(--code-key); font-weight: 500; }
  .cs { color: var(--code-str); }
  .cp { color: var(--code-punct); }

  .params {
    margin: 0.875rem 0 0;
    border: 1px solid var(--line);
    background: var(--surface);
  }
  .param {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: 0.25rem 1rem;
    padding: 0.625rem 1rem;
    border-top: 1px solid var(--line);
    align-items: baseline;
  }
  .param:first-child { border-top: 0; }
  .param dt {
    color: var(--muted);
    font-size: 0.8125rem;
    font-weight: 600;
  }
  .param dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 0.875rem;
  }

  .result {
    margin: 0.875rem 0 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid var(--slate);
    background: var(--surface);
    color: var(--muted);
    font-size: 0.875rem;
    line-height: 1.55;
  }
  .result code { color: var(--fg); }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    padding: 1rem 2rem;
    font-size: 0.875rem;
  }
  .links a { color: var(--muted); }
  .links a:hover { color: var(--fg); }

  .below {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    margin-top: 0.75rem;
    padding: 0 2px;
    font-size: 0.75rem;
  }
  .below a { padding: 0.25rem 0; color: var(--muted); text-decoration: none; }
  .below a:hover { color: var(--fg); }
  .attribution { margin-left: auto; display: inline-flex; align-items: center; gap: 0.25rem; }
  .attribution svg { width: 0.85em; height: 0.85em; flex: none; }

  @media (max-width: 720px) {
    .frame { width: calc(100% - 1.5rem); margin: 1.25rem auto 1.5rem; }
    .bar { padding: 0.75rem 1.25rem; }
    .hero { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; padding: 1.5rem 1.25rem; }
    .step { padding: 1.375rem 1.25rem; }
    .links { padding: 1rem 1.25rem; }
  }
  @media (max-width: 480px) {
    .frame { width: calc(100% - 1rem); margin: 0.75rem auto 1.25rem; }
    .bar, .hero, .step, .links { padding-left: 1rem; padding-right: 1rem; }
    .param { grid-template-columns: minmax(0, 1fr); gap: 0.125rem; }
  }
</style>
</head>
<body>
<div class="frame">
<main>
<header class="bar">
<span class="brand"><svg viewBox="0 0 60 60" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h60v60H0z M20 20h20v20H20z" fill="currentColor" fill-rule="evenodd"/></svg>login.samebase.com</span>
<span class="proto">OpenID Connect</span>
</header>

<section class="hero">
<div>
<h1>Google and GitHub sign-in for any site.</h1>
<p class="lead">No registration and no client secret. Serve one JSON file on your site and point any OpenID Connect library here.</p>
<div class="cta">
<a class="btn btn-primary" href="${REPOSITORY}#add-sign-in-to-your-site">Guide and source</a>
<a class="btn btn-secondary" href="/.well-known/openid-configuration">Discovery</a>
</div>
</div>
<div class="specimen-stage" aria-hidden="true">
<div class="specimen">
<p class="specimen-title">Sign in to<strong>app.example.com</strong></p>
<div class="specimen-actions">
<div class="specimen-btn"><svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>Continue with GitHub</div>
<div class="specimen-btn"><svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</div>
</div>
</div>
</div>
</section>

<div class="steps">
<section class="step">
<div class="step-head">
<span class="step-num" aria-hidden="true">1</span>
<h2>Serve a metadata file on your site</h2>
</div>
<p class="step-note">Host this JSON over https. Its URL is your client id; each redirect URI must share its origin.</p>
<div class="code-panel">
<div class="code-bar">https://app.example.com/oauth-client.json</div>
<pre><code><span class="cp">{</span>
  <span class="ck">"client_id"</span><span class="cp">:</span> <span class="cs">"https://app.example.com/oauth-client.json"</span><span class="cp">,</span>
  <span class="ck">"client_name"</span><span class="cp">:</span> <span class="cs">"My app"</span><span class="cp">,</span>
  <span class="ck">"redirect_uris"</span><span class="cp">:</span> <span class="cp">[</span><span class="cs">"https://app.example.com/auth/callback"</span><span class="cp">],</span>
  <span class="ck">"token_endpoint_auth_methods_supported"</span><span class="cp">:</span> <span class="cp">[</span><span class="cs">"none"</span><span class="cp">]</span>
<span class="cp">}</span></code></pre>
</div>
</section>

<section class="step">
<div class="step-head">
<span class="step-num" aria-hidden="true">2</span>
<h2>Point your OpenID Connect library here</h2>
</div>
<dl class="params">
<div class="param"><dt>Issuer</dt><dd><code>https://login.samebase.com</code></dd></div>
<div class="param"><dt>Client id</dt><dd>The URL of your JSON file</dd></div>
<div class="param"><dt>Client auth</dt><dd>No client secret; code flow with PKCE (S256)</dd></div>
<div class="param"><dt>Scope</dt><dd><code>openid email profile</code></dd></div>
</dl>
<p class="result">Your site gets an <code>id_token</code> whose <code>sub</code> is <code>google:&lt;id&gt;</code> or <code>github:&lt;id&gt;</code>. Users stay in your app; this broker keeps no user accounts.</p>
</section>
</div>

<nav class="links" aria-label="Resources">
<a href="${REPOSITORY}#add-sign-in-to-your-site">Guide and source</a>
<a href="/.well-known/openid-configuration">Discovery</a>
<a href="https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/">The standard</a>
</nav>
</main>
<footer class="below">
<a href="https://samebase.com/privacy">Privacy</a>
<a href="https://samebase.com/terms">Terms</a>
<a class="attribution" href="https://samebase.com"><svg viewBox="0 0 60 60" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h60v60H0z M20 20h20v20H20z" fill="currentColor" fill-rule="evenodd"/></svg>Samebase</a>
</footer>
</div>
</body>
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
