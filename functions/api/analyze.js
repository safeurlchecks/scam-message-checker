const riskWords = {
  urgency: [/urgent/i, /immediately/i, /today/i, /now/i, /last warning/i, /expire/i, /limited time/i, /আজই/i, /এখনই/i, /শেষ সতর্ক/i, /জরুরি/i, /तुरंत/i, /अभी/i, /فوری/i, /آج/i],
  threat: [/blocked/i, /suspended/i, /legal action/i, /fine/i, /arrest/i, /closed/i, /ban/i, /বন্ধ/i, /জরিমানা/i, /আইনি/i, /গ্রেফতার/i, /ब्लॉक/i, /कानूनी/i, /معطل/i],
  prize: [/congratulations/i, /winner/i, /lottery/i, /gift/i, /reward/i, /free/i, /জিতেছেন/i, /পুরস্কার/i, /লটারি/i, /ফ্রি/i, /इनाम/i, /लॉटरी/i, /انعام/i],
  payment: [/pay/i, /payment/i, /fee/i, /card/i, /crypto/i, /gift card/i, /wire/i, /bkash/i, /nagad/i, /রিচার্জ/i, /ফি/i, /টাকা/i, /কার্ড/i, /পেমেন্ট/i, /भुगतान/i, /फीस/i, /رقم/i, /ادائیگی/i],
  credentials: [/otp/i, /password/i, /pin/i, /login/i, /verify/i, /account/i, /পাসওয়ার্ড/i, /ওটিপি/i, /পিন/i, /লগইন/i, /ভেরিফাই/i, /पासवर्ड/i, /اکاؤنٹ/i, /او ٹی پی/i],
  personal: [/passport/i, /nid/i, /ssn/i, /date of birth/i, /bank account/i, /জাতীয় পরিচয়/i, /পাসপোর্ট/i, /জন্ম/i, /ব্যাংক অ্যাকাউন্ট/i, /पासपोर्ट/i, /जन्म/i, /شناخت/i],
  delivery: [/parcel/i, /delivery/i, /shipment/i, /courier/i, /package/i, /পার্সেল/i, /ডেলিভারি/i, /কুরিয়ার/i, /पार्सल/i, /डिलीवरी/i, /پارسل/i],
  job: [/job/i, /task/i, /salary/i, /work from home/i, /commission/i, /চাকরি/i, /টাস্ক/i, /বেতন/i, /কমিশন/i, /नौकरी/i, /कमिशन/i, /نوکری/i],
  government: [/tax/i, /police/i, /court/i, /immigration/i, /customs/i, /gov/i, /ট্যাক্স/i, /পুলিশ/i, /কোর্ট/i, /ইমিগ্রেশন/i, /সরকার/i, /सरकार/i, /पुलिस/i, /حکومت/i]
};

const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz', '.click', '.work', '.country', '.stream', '.gq', '.tk', '.ml'];
const shorteners = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','buff.ly','cutt.ly','rebrand.ly','shorturl.at','is.gd','s.id','lnkd.in'];
const knownBrands = ['paypal','google','facebook','meta','whatsapp','amazon','apple','microsoft','netflix','binance','bkash','nagad','bracbank','dbbl','bank','dhl','fedex','ups'];
const trustedDomains = ['google.com','paypal.com','facebook.com','whatsapp.com','amazon.com','apple.com','microsoft.com','netflix.com','dhl.com','fedex.com','ups.com'];
const customBlacklist = ['example-scam.test'];
const customAllowlist = ['example.com'];

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const message = String(body.message || '').slice(0, 12000);
    const urls = extractUrls(message).slice(0, 8);
    const scored = scoreMessage(message, urls);
    const links = [];
    const backendSignals = [];

    for (const url of urls) {
      const analyzed = await analyzeUrl(url, context.env, backendSignals);
      links.push(analyzed);
    }

    let score = scored.score + backendSignals.reduce((sum, s) => sum + (s.points || 0), 0);
    score = clampScore(score);

    return json({
      app: 'Scam Message Checker',
      createdAt: new Date().toISOString(),
      engine: 'cloudflare-functions',
      score,
      signals: [...scored.signals, ...backendSignals],
      links
    });
  } catch (error) {
    return json({ error: 'Analyze failed', details: String(error && error.message || error) }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: true, endpoint: '/api/analyze', method: 'POST', active: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function extractUrls(text) { const regex = /((https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/[^\s]*)?)/gi; return [...new Set((text.match(regex) || []).map(normalizeUrl).filter(Boolean))]; }
function normalizeUrl(raw) { let u = String(raw || '').trim().replace(/[),.]+$/, ''); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const parsed = new URL(u); if (!['http:', 'https:'].includes(parsed.protocol)) return ''; return parsed.toString(); } catch { return ''; } }
function getHostname(url) { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } }
function addSignal(signals, type, points, detail = '') { signals.push({ type, points, detail }); }
function clampScore(score) { return Math.max(0, Math.min(100, Math.round(score))); }

function scoreMessage(text, urls = []) {
  const signals = [];
  for (const [type, patterns] of Object.entries(riskWords)) {
    if (patterns.some(rx => rx.test(text))) {
      const points = { urgency: 10, threat: 12, prize: 12, payment: 18, credentials: 25, personal: 22, delivery: 12, job: 12, government: 16 }[type] || 8;
      addSignal(signals, type, points);
    }
  }
  if (/[A-Z]{4,}|!!!|\$\$\$|free money/i.test(text)) addSignal(signals, 'formatting', 6);
  if (text.length < 35 && urls.length) addSignal(signals, 'thin', 7);
  for (const url of urls) addUrlSignals(signals, url);
  return { score: clampScore(signals.reduce((sum, s) => sum + (s.points || 0), 0)), signals };
}

function addUrlSignals(signals, url) {
  const host = getHostname(url);
  if (!host) return;
  if (shorteners.includes(host)) addSignal(signals, 'shortUrl', 10, host);
  if (/^http:\/\//i.test(url)) addSignal(signals, 'http', 10, host);
  if (url.length > 120) addSignal(signals, 'longUrl', 7, host);
  if (suspiciousTlds.some(tld => host.endsWith(tld))) addSignal(signals, 'tld', 8, host);
  if (host.startsWith('xn--') || host.includes('.xn--')) addSignal(signals, 'punycode', 15, host);
  if (/[?&](redirect|url|next|return|token|session|login)=/i.test(url)) addSignal(signals, 'params', 10, host);
  const leet = host.replaceAll('0','o').replaceAll('1','l').replaceAll('3','e').replaceAll('@','a');
  for (const brand of knownBrands) {
    if (leet.includes(brand) && !trustedDomains.some(d => host === d || host.endsWith('.' + d))) { addSignal(signals, 'brand', 20, host); break; }
  }
  if (host.split('.').length >= 4) addSignal(signals, 'subdomain', 8, host);
}

async function analyzeUrl(url, env, backendSignals) {
  const host = getHostname(url);
  const checks = {
    shortener: shorteners.includes(host), suspiciousTld: suspiciousTlds.some(tld => host.endsWith(tld)), punycode: host.startsWith('xn--') || host.includes('.xn--'), longUrl: url.length > 120,
    suspiciousParams: /[?&](redirect|url|next|return|token|session|login)=/i.test(url), customBlacklist: customBlacklist.includes(host), customAllowlist: customAllowlist.includes(host), securityHeaders: null, googleSafeBrowsing: null, virusTotal: null
  };
  const result = { originalUrl: url, normalizedUrl: url, finalUrl: url, hostname: host, redirectChain: [url], httpStatus: null, https: url.startsWith('https://'), backendChecked: true, checks, notes: [], extraRisk: 0 };

  if (checks.customBlacklist) { result.extraRisk += 45; result.notes.push('Domain matched custom blacklist.'); addSignal(backendSignals, 'blacklist', 45, host); }
  if (checks.customAllowlist) { result.extraRisk -= 20; result.notes.push('Domain matched custom allowlist.'); addSignal(backendSignals, 'allowlist', -20, host); }

  if (!isAllowedForFetch(url)) {
    result.notes.push('URL blocked by safety guard; localhost/private/internal hosts are not fetched.');
    result.extraRisk += 10;
    return result;
  }

  const live = await followRedirects(url);
  result.finalUrl = live.finalUrl;
  result.hostname = getHostname(live.finalUrl || url);
  result.redirectChain = live.redirectChain;
  result.httpStatus = live.status;
  result.https = (live.finalUrl || url).startsWith('https://');
  result.checks.securityHeaders = live.securityHeaders;
  result.notes.push(...live.notes);

  if ((live.redirectChain || []).length > 3) { result.extraRisk += 10; addSignal(backendSignals, 'redirect', 10, result.hostname); }
  if (!result.https) { result.extraRisk += 10; addSignal(backendSignals, 'http', 10, result.hostname); }
  if (live.securityHeaders && live.securityHeaders.missing.length >= 4) { result.extraRisk += 5; addSignal(backendSignals, 'headers', 5, result.hostname); }

  if (env.GOOGLE_SAFE_BROWSING_API_KEY) {
    result.checks.googleSafeBrowsing = await googleSafeBrowsingCheck(result.finalUrl, env.GOOGLE_SAFE_BROWSING_API_KEY);
    if (result.checks.googleSafeBrowsing?.unsafe) { result.extraRisk += 45; addSignal(backendSignals, 'gsb', 45, result.hostname); }
  }
  if (env.VIRUSTOTAL_API_KEY) {
    result.checks.virusTotal = await virusTotalCheck(result.finalUrl, env.VIRUSTOTAL_API_KEY);
    const vtBad = (result.checks.virusTotal?.malicious || 0) + (result.checks.virusTotal?.suspicious || 0);
    if (vtBad > 0) { result.extraRisk += 45; addSignal(backendSignals, 'vt', 45, result.hostname); }
  }
  return result;
}

function isAllowedForFetch(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    if (host === 'localhost' || host.endsWith('.localhost')) return false;
    if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
    if (host === '::1' || host.startsWith('fc') || host.startsWith('fd')) return false;
    return true;
  } catch { return false; }
}

async function followRedirects(startUrl) {
  const chain = [];
  let current = startUrl;
  let status = null;
  let headers = null;
  const notes = [];
  for (let i = 0; i < 7; i++) {
    chain.push(current);
    try {
      const response = await fetch(current, { method: 'GET', redirect: 'manual', headers: { 'accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'user-agent': 'ScamMessageChecker/2.0 (+defensive URL analysis)', 'range': 'bytes=0-4096' }, signal: AbortSignal.timeout(7000) });
      status = response.status;
      headers = response.headers;
      if ([301,302,303,307,308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) break;
        const next = new URL(location, current).toString();
        if (!isAllowedForFetch(next)) { notes.push('Redirect target blocked by safety guard.'); break; }
        if (chain.includes(next)) { notes.push('Redirect loop detected.'); break; }
        current = next;
        continue;
      }
      break;
    } catch (error) {
      notes.push('Live fetch failed: ' + String(error && error.message || error));
      break;
    }
  }
  return { finalUrl: current, redirectChain: chain, status, securityHeaders: headers ? analyzeSecurityHeaders(headers) : null, notes };
}

function analyzeSecurityHeaders(headers) {
  const required = ['strict-transport-security','content-security-policy','x-frame-options','x-content-type-options','referrer-policy','permissions-policy'];
  const present = required.filter(h => headers.has(h));
  const missing = required.filter(h => !headers.has(h));
  return { present, missing };
}

async function googleSafeBrowsingCheck(url, apiKey) {
  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    const payload = { client: { clientId: 'scam-message-checker', clientVersion: '2.0.0' }, threatInfo: { threatTypes: ['MALWARE','SOCIAL_ENGINEERING','UNWANTED_SOFTWARE','POTENTIALLY_HARMFUL_APPLICATION'], platformTypes: ['ANY_PLATFORM'], threatEntryTypes: ['URL'], threatEntries: [{ url }] } };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    const matches = Array.isArray(data.matches) ? data.matches : [];
    return { unsafe: matches.length > 0, matches };
  } catch (error) { return { error: String(error && error.message || error) }; }
}

async function virusTotalCheck(url, apiKey) {
  try {
    const id = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const res = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, { headers: { 'x-apikey': apiKey } });
    if (!res.ok) return { error: 'VirusTotal lookup failed', status: res.status };
    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats || {};
    return { malicious: stats.malicious || 0, suspicious: stats.suspicious || 0, harmless: stats.harmless || 0, undetected: stats.undetected || 0 };
  } catch (error) { return { error: String(error && error.message || error) }; }
}
