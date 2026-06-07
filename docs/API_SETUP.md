# Optional API Setup

The clean build needs only two optional APIs.

## 1. Google Safe Browsing

Environment variable name:

```text
GOOGLE_SAFE_BROWSING_API_KEY
```

Purpose:

- Checks whether a URL matches Google Safe Browsing threat lists.
- Adds a strong danger signal when a match is found.

## 2. VirusTotal

Environment variable name:

```text
VIRUSTOTAL_API_KEY
```

Purpose:

- Checks VirusTotal URL reputation data.
- Displays malicious and suspicious detection counts.

## Where to add keys in Cloudflare

1. Open Cloudflare Dashboard.
2. Go to Workers & Pages.
3. Select your Pages project.
4. Open Settings.
5. Open Variables and Secrets.
6. Click Add.
7. Add the variable name and key value.
8. Save.
9. Redeploy the project.

Never place API keys inside `index.html` or `assets/app.js` because those files are public.
