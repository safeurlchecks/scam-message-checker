# Scam Message Checker - Clean Active Build

This is a free-to-host scam message and link risk checker for Cloudflare Pages or GitHub Pages.

## What changed in this clean build

Removed fake/placeholder features from the UI and documentation. The website now lists only features that are working now or API-ready with a clear key requirement.

Removed placeholders:

- WHOIS/domain age
- IP geolocation
- hosting provider lookup
- screenshot preview
- QR scanner
- OCR screenshot upload
- suspicious script crawler
- external script counter
- community reports
- admin panel
- scan history database
- abuse contact lookup

## Best hosting

Use Cloudflare Pages with Git connection. Cloudflare Pages Functions are needed for live redirect-chain and website checks.

GitHub Pages can host the website, but it will run in static fallback mode only.

## Cloudflare Pages setup

1. Unzip the project.
2. Create a GitHub repository.
3. Upload all project files to the repository root.
4. Open Cloudflare Dashboard.
5. Go to Workers & Pages.
6. Click Create application.
7. Choose Pages.
8. Click Connect to Git.
9. Select your GitHub repository.
10. Use these build settings:
   - Framework preset: None
   - Build command: leave empty
   - Build output directory: /
   - Root directory: leave empty or /
11. Click Save and Deploy.
12. Open your deployed URL.
13. Test `/api/health`.
14. Paste a suspicious message and click Analyze Now.

## Optional API keys

Add these in Cloudflare Pages:

Settings → Variables and Secrets → Add

- `GOOGLE_SAFE_BROWSING_API_KEY`
- `VIRUSTOTAL_API_KEY`

The tool works without these keys, but reputation checking is stronger with them.

## GitHub Pages setup

1. Open your GitHub repository.
2. Go to Settings.
3. Go to Pages.
4. Source: Deploy from a branch.
5. Branch: main.
6. Folder: /root.
7. Save.

GitHub Pages cannot run `/functions/api/analyze.js`, so redirect-chain, final destination after redirects, HTTP status, security headers, Google Safe Browsing, and VirusTotal checks will not run there.

## Ad setup

Search `ad-slot` in `index.html`. Paste your ad code only inside those placeholders after your ad network account is approved.

Do not make ads look like scan buttons, warning buttons, or download buttons.
