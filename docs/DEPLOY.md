# Deployment Guide

## Recommended: Cloudflare Pages

Use Cloudflare Pages with GitHub connection. This is required for backend checks.

Required project structure:

```text
index.html
assets/
functions/
privacy.html
about.html
_headers
_redirects
package.json
wrangler.toml
```

Cloudflare build settings:

```text
Framework preset: None
Build command: empty
Build output directory: /
Root directory: empty or /
```

After deployment, test:

```text
/api/health
```

If it returns JSON, the backend is working.

## GitHub Pages

GitHub Pages works only for static/basic mode. Backend checks will not work.
