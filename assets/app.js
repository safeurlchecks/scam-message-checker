const $ = (id) => document.getElementById(id);
let lastReport = null;

const activeFeatures = [
  ['Message paste box', 'Paste SMS, WhatsApp, email, or plain URL'],
  ['Output language selector', 'Result content supports English, Bangla, Hindi, and Urdu'],
  ['Message type selector', 'Auto, SMS, WhatsApp, email, and social modes'],
  ['Client-side fallback', 'Works on GitHub Pages with basic local checks'],
  ['Cloudflare backend mode', 'Runs live URL checks through Pages Functions'],
  ['Risk score', 'Calculates a 0–100 score'],
  ['Final open/do-not-open decision', 'Clear verdict at the top of the result'],
  ['Confidence score', 'Shows how much evidence was found'],
  ['Message meaning explanation', 'Explains what the suspicious message is trying to make the user do'],
  ['Recommended action', 'Tells the user whether to avoid, verify, block, or report'],
  ['All URL extraction', 'Finds all visible URLs in the message'],
  ['URL normalization', 'Adds protocol and cleans copied punctuation'],
  ['Short link detection', 'Detects common shorteners such as bit.ly and tinyurl'],
  ['Redirect chain check', 'Cloudflare mode follows redirects safely'],
  ['Final destination URL', 'Shows where the link finally lands'],
  ['Hostname/domain display', 'Shows the real website host'],
  ['HTTPS check', 'Flags non-HTTPS links'],
  ['HTTP status check', 'Cloudflare mode shows status code'],
  ['Security header check', 'Checks common headers such as HSTS, CSP, XFO, Referrer-Policy'],
  ['Missing header count', 'Shows how many important headers are missing'],
  ['Urgency detector', 'Detects pressure words such as urgent, today, now'],
  ['Threat detector', 'Detects blocked, suspended, fine, legal action patterns'],
  ['Prize/reward detector', 'Detects lottery, gift, winner, reward wording'],
  ['Payment request detector', 'Detects fees, card, crypto, gift card, mobile payment wording'],
  ['Credential request detector', 'Detects OTP, password, PIN, login, verification requests'],
  ['Personal info detector', 'Detects passport, NID, DOB, bank account requests'],
  ['Delivery scam detector', 'Detects parcel, package, courier, shipment patterns'],
  ['Fake job/task detector', 'Detects task job, salary, commission, work-from-home patterns'],
  ['Government impersonation detector', 'Detects tax, police, court, customs, immigration patterns'],
  ['Suspicious formatting detector', 'Detects excessive caps, !!!, $$$, free money style wording'],
  ['Thin message detector', 'Flags very short messages that only push a link'],
  ['Suspicious TLD check', 'Flags risky-looking TLDs such as .zip, .top, .xyz'],
  ['Punycode/Unicode domain check', 'Flags xn-- domains that can hide lookalike characters'],
  ['Long URL check', 'Flags very long URLs'],
  ['Suspicious parameter check', 'Flags redirect, token, session, login, return parameters'],
  ['Subdomain trick detector', 'Flags hosts with many subdomains'],
  ['Brand lookalike check', 'Flags common brand names used inside unofficial domains'],
  ['Custom blacklist', 'Editable list inside Cloudflare function code'],
  ['Custom allowlist', 'Editable list inside Cloudflare function code'],
  ['Google Safe Browsing integration', 'Works after adding GOOGLE_SAFE_BROWSING_API_KEY'],
  ['VirusTotal integration', 'Works after adding VIRUSTOTAL_API_KEY'],
  ['Multi-link analysis', 'Analyzes every URL found in the message'],
  ['Copy report', 'Copies a readable report'],
  ['JSON export', 'Downloads full result as JSON'],
  ['Print / save PDF', 'Uses browser print dialog'],
  ['Ad slots', 'Header and result ad placeholders'],
  ['Mobile responsive layout', 'Works on phone screens'],
  ['Privacy warning', 'Warns users not to paste sensitive data']
];

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

const i18n = {
  en: {
    low: 'Low Risk', suspicious: 'Suspicious', high: 'High Risk / Suspicious', dangerous: 'Dangerous',
    openLow: 'You may open it carefully, but verify the official source first.',
    openSuspicious: 'Do not open it directly. Verify the sender and the domain first.',
    openHigh: 'Do not open this now. Verify through the official app or website first.',
    openDanger: 'No — opening this link is not recommended.',
    noMessage: 'No message provided.', noSignal: 'No major scam signal found in the text.', noUrl: 'No URL found in the message.',
    meaningDefault: 'The message is not clearly proven as a scam, but the wording and links should still be verified.',
    linksFound: (n) => `${n} link${n === 1 ? '' : 's'} found in the message.`,
    meaning: { delivery:'The message talks about parcel, courier, or delivery verification.', credentials:'It asks for login, verification, OTP, PIN, or password-related action.', payment:'It pressures the user to pay money or a fee.', threat:'It uses account block, fine, legal action, or similar threats.', prize:'It promises a prize, gift, lottery, or reward.', job:'It looks like a job, task, salary, or commission offer.', government:'It looks like a government, police, tax, customs, or immigration impersonation.' },
    actionDanger: ['Do not open the link.', 'Do not enter OTP, password, card number, bank details, or identity documents.', 'Open the official app or website manually and verify.', 'Block or report the sender.'],
    actionWarn: ['Avoid direct clicking.', 'Check the domain spelling carefully.', 'Verify through the official phone number, app, or website.'],
    actionLow: ['Low-risk signals were found, but do not share sensitive information.', 'For banking, delivery, or government work, use the official app or bookmarked website.'],
    signal: signalTextEn
  },
  bn: {
    low: 'কম ঝুঁকি', suspicious: 'সন্দেহজনক', high: 'উচ্চ ঝুঁকি / সন্দেহজনক', dangerous: 'বিপজ্জনক',
    openLow: 'সতর্কভাবে ওপেন করা যেতে পারে, তবে আগে official source verify করুন।',
    openSuspicious: 'সরাসরি ওপেন করবেন না। আগে sender এবং domain verify করুন।',
    openHigh: 'এখনই ওপেন করবেন না। আগে official app বা website থেকে verify করুন।',
    openDanger: 'না — এই লিংক ওপেন করা ঠিক হবে না।',
    noMessage: 'কোনো message দেওয়া হয়নি।', noSignal: 'Text-এর মধ্যে বড় scam signal পাওয়া যায়নি।', noUrl: 'Message-এ কোনো URL পাওয়া যায়নি।',
    meaningDefault: 'মেসেজটি scam হিসেবে নিশ্চিত প্রমাণিত নয়, কিন্তু wording ও link verify করা দরকার।',
    linksFound: (n) => `মেসেজে ${n}টি link পাওয়া গেছে।`,
    meaning: { delivery:'মেসেজটি parcel, courier বা delivery verification নিয়ে কথা বলছে।', credentials:'এটি login, verification, OTP, PIN বা password-related action চাইছে।', payment:'এটি টাকা বা fee দিতে চাপ দিচ্ছে।', threat:'এটি account block, fine, legal action বা একই ধরনের threat ব্যবহার করছে।', prize:'এটি prize, gift, lottery বা reward promise করছে।', job:'এটি job, task, salary বা commission offer-এর মতো দেখাচ্ছে।', government:'এটি government, police, tax, customs বা immigration impersonation-এর মতো দেখাচ্ছে।' },
    actionDanger: ['Link ওপেন করবেন না।', 'OTP, password, card number, bank details বা identity document দেবেন না।', 'Official app বা website manually খুলে verify করুন।', 'Sender block/report করুন।'],
    actionWarn: ['Direct click avoid করুন।', 'Domain spelling ভালোভাবে check করুন।', 'Official phone number, app বা website থেকে verify করুন।'],
    actionLow: ['Low-risk signal পাওয়া গেছে, তবুও sensitive information দেবেন না।', 'Banking, delivery বা government কাজ হলে official app/bookmarked website ব্যবহার করুন।'],
    signal: signalTextBn
  },
  hi: {
    low: 'कम जोखिम', suspicious: 'संदिग्ध', high: 'उच्च जोखिम / संदिग्ध', dangerous: 'खतरनाक',
    openLow: 'सावधानी से खोल सकते हैं, लेकिन पहले official source verify करें।',
    openSuspicious: 'Direct open न करें। पहले sender और domain verify करें।',
    openHigh: 'अभी open न करें। पहले official app या website से verify करें।',
    openDanger: 'नहीं — इस link को open करना ठीक नहीं है।',
    noMessage: 'कोई message नहीं दिया गया।', noSignal: 'Text में बड़ा scam signal नहीं मिला।', noUrl: 'Message में कोई URL नहीं मिला।',
    meaningDefault: 'Message scam है यह पक्का साबित नहीं है, लेकिन wording और link verify करना जरूरी है।',
    linksFound: (n) => `Message में ${n} link मिला।`,
    meaning: { delivery:'Message parcel, courier या delivery verification की बात कर रहा है।', credentials:'यह login, verification, OTP, PIN या password-related action मांग रहा है।', payment:'यह पैसे या fee देने का दबाव डाल रहा है।', threat:'यह account block, fine, legal action जैसी threat use कर रहा है।', prize:'यह prize, gift, lottery या reward promise कर रहा है।', job:'यह job, task, salary या commission offer जैसा दिखता है।', government:'यह government, police, tax, customs या immigration impersonation जैसा दिखता है।' },
    actionDanger: ['Link open न करें।', 'OTP, password, card number, bank details या identity documents न दें।', 'Official app या website manually खोलकर verify करें।', 'Sender को block/report करें।'],
    actionWarn: ['Direct click avoid करें।', 'Domain spelling carefully check करें।', 'Official phone number, app या website से verify करें।'],
    actionLow: ['Low-risk signal मिला है, फिर भी sensitive information न दें।', 'Banking, delivery या government work के लिए official app/bookmarked website use करें।'],
    signal: signalTextHi
  },
  ur: {
    low: 'کم خطرہ', suspicious: 'مشکوک', high: 'زیادہ خطرہ / مشکوک', dangerous: 'خطرناک',
    openLow: 'احتیاط سے کھولا جا سکتا ہے، مگر پہلے official source verify کریں۔',
    openSuspicious: 'Direct open نہ کریں۔ پہلے sender اور domain verify کریں۔',
    openHigh: 'ابھی open نہ کریں۔ پہلے official app یا website سے verify کریں۔',
    openDanger: 'نہیں — اس link کو open کرنا ٹھیک نہیں ہے۔',
    noMessage: 'کوئی message نہیں دیا گیا۔', noSignal: 'Text میں بڑا scam signal نہیں ملا۔', noUrl: 'Message میں کوئی URL نہیں ملا۔',
    meaningDefault: 'Message scam ہے یہ مکمل ثابت نہیں، مگر wording اور link verify کرنا ضروری ہے۔',
    linksFound: (n) => `Message میں ${n} link ملا۔`,
    meaning: { delivery:'Message parcel, courier یا delivery verification کی بات کر رہا ہے۔', credentials:'یہ login, verification, OTP, PIN یا password-related action مانگ رہا ہے۔', payment:'یہ رقم یا fee دینے کا دباؤ ڈال رہا ہے۔', threat:'یہ account block, fine, legal action جیسی threat استعمال کر رہا ہے۔', prize:'یہ prize, gift, lottery یا reward promise کر رہا ہے۔', job:'یہ job, task, salary یا commission offer جیسا لگتا ہے۔', government:'یہ government, police, tax, customs یا immigration impersonation جیسا لگتا ہے۔' },
    actionDanger: ['Link open نہ کریں۔', 'OTP, password, card number, bank details یا identity documents نہ دیں۔', 'Official app یا website manually کھول کر verify کریں۔', 'Sender کو block/report کریں۔'],
    actionWarn: ['Direct click avoid کریں۔', 'Domain spelling carefully check کریں۔', 'Official phone number, app یا website سے verify کریں۔'],
    actionLow: ['Low-risk signal ملا ہے، پھر بھی sensitive information نہ دیں۔', 'Banking, delivery یا government work کے لیے official app/bookmarked website use کریں۔'],
    signal: signalTextUr
  }
};

function signalTextEn(s){ return signalBase(s, {
  urgency:'Urgency/pressure language found', threat:'Threat/account block/legal action language found', prize:'Prize/gift/lottery style wording found', payment:'Payment or fee request found', credentials:'OTP/password/login/verification request found', personal:'Personal identity/bank information request found', delivery:'Parcel/delivery scam pattern found', job:'Fake job/task/commission pattern found', government:'Government/police/tax impersonation pattern found', formatting:'Suspicious formatting or exaggerated wording found', thin:'Very short message with link; context is weak', shortUrl:'Shortened URL found', http:'Non-HTTPS link found', longUrl:'Very long URL found', tld:'Risky-looking TLD found', punycode:'Punycode/Unicode domain found', params:'Suspicious URL parameter found', brand:'Possible brand impersonation/lookalike domain', subdomain:'Many subdomains found; real domain may be different', blacklist:'Domain matched custom blacklist', allowlist:'Domain matched custom allowlist', redirect:'Multiple redirects found', headers:'Several security headers are missing', gsb:'Google Safe Browsing unsafe match found', vt:'VirusTotal reported malicious or suspicious results'
}); }
function signalTextBn(s){ return signalBase(s, {
  urgency:'Urgency/pressure language পাওয়া গেছে', threat:'Threat/account block/legal action language পাওয়া গেছে', prize:'Prize/gift/lottery style wording পাওয়া গেছে', payment:'Payment বা fee request পাওয়া গেছে', credentials:'OTP/password/login/verification request পাওয়া গেছে', personal:'Personal identity/bank information request পাওয়া গেছে', delivery:'Parcel/delivery scam pattern পাওয়া গেছে', job:'Fake job/task/commission pattern পাওয়া গেছে', government:'Government/police/tax impersonation pattern পাওয়া গেছে', formatting:'Suspicious formatting বা অতিরঞ্জিত wording পাওয়া গেছে', thin:'খুব ছোট message-এর সঙ্গে link আছে; context দুর্বল', shortUrl:'Shortened URL পাওয়া গেছে', http:'Non-HTTPS link পাওয়া গেছে', longUrl:'খুব long URL পাওয়া গেছে', tld:'Risky-looking TLD পাওয়া গেছে', punycode:'Punycode/Unicode domain পাওয়া গেছে', params:'Suspicious URL parameter পাওয়া গেছে', brand:'Possible brand impersonation/lookalike domain', subdomain:'অনেক subdomain আছে; real domain ভিন্ন হতে পারে', blacklist:'Domain custom blacklist-এ আছে', allowlist:'Domain custom allowlist-এ আছে', redirect:'Multiple redirects পাওয়া গেছে', headers:'অনেক security header missing', gsb:'Google Safe Browsing unsafe match পেয়েছে', vt:'VirusTotal malicious/suspicious result দিয়েছে'
}); }
function signalTextHi(s){ return signalBase(s, {
  urgency:'Urgency/pressure language मिला', threat:'Threat/account block/legal action language मिला', prize:'Prize/gift/lottery wording मिला', payment:'Payment या fee request मिला', credentials:'OTP/password/login/verification request मिला', personal:'Personal identity/bank information request मिला', delivery:'Parcel/delivery scam pattern मिला', job:'Fake job/task/commission pattern मिला', government:'Government/police/tax impersonation pattern मिला', formatting:'Suspicious formatting मिला', thin:'बहुत short message के साथ link है; context weak है', shortUrl:'Shortened URL मिला', http:'Non-HTTPS link मिला', longUrl:'बहुत long URL मिला', tld:'Risky-looking TLD मिला', punycode:'Punycode/Unicode domain मिला', params:'Suspicious URL parameter मिला', brand:'Possible brand impersonation/lookalike domain', subdomain:'बहुत subdomains हैं; real domain अलग हो सकता है', blacklist:'Domain custom blacklist में है', allowlist:'Domain custom allowlist में है', redirect:'Multiple redirects मिले', headers:'कई security headers missing हैं', gsb:'Google Safe Browsing unsafe match मिला', vt:'VirusTotal ने malicious/suspicious result दिया'
}); }
function signalTextUr(s){ return signalBase(s, {
  urgency:'Urgency/pressure language ملا', threat:'Threat/account block/legal action language ملا', prize:'Prize/gift/lottery wording ملا', payment:'Payment یا fee request ملا', credentials:'OTP/password/login/verification request ملا', personal:'Personal identity/bank information request ملا', delivery:'Parcel/delivery scam pattern ملا', job:'Fake job/task/commission pattern ملا', government:'Government/police/tax impersonation pattern ملا', formatting:'Suspicious formatting ملا', thin:'بہت short message کے ساتھ link ہے؛ context weak ہے', shortUrl:'Shortened URL ملا', http:'Non-HTTPS link ملا', longUrl:'بہت long URL ملا', tld:'Risky-looking TLD ملا', punycode:'Punycode/Unicode domain ملا', params:'Suspicious URL parameter ملا', brand:'Possible brand impersonation/lookalike domain', subdomain:'بہت subdomains ہیں؛ real domain الگ ہو سکتا ہے', blacklist:'Domain custom blacklist میں ہے', allowlist:'Domain custom allowlist میں ہے', redirect:'Multiple redirects ملے', headers:'کئی security headers missing ہیں', gsb:'Google Safe Browsing unsafe match ملا', vt:'VirusTotal نے malicious/suspicious result دیا'
}); }

function signalBase(s, map) {
  const base = map[s.type] || s.type || 'Risk signal';
  return s.detail ? `${base}: ${s.detail}` : base;
}

function renderFeatureGrid() {
  const grid = $('featureGrid');
  grid.innerHTML = activeFeatures.map((item, index) => `
    <div class="feature-item">
      <strong>${index + 1}. ${escapeHtml(item[0])}</strong>
      <small>${escapeHtml(item[1])}</small>
    </div>
  `).join('');
}

function L(lang) { return i18n[lang] || i18n.en; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function extractUrls(text) { const regex = /((https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:\/[^\s]*)?)/gi; return [...new Set((text.match(regex) || []).map(normalizeUrl).filter(Boolean))]; }
function normalizeUrl(raw) { let u = String(raw || '').trim().replace(/[),.]+$/, ''); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const parsed = new URL(u); if (!['http:', 'https:'].includes(parsed.protocol)) return ''; return parsed.toString(); } catch { return ''; } }
function getHostname(url) { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } }

function addSignal(signals, type, points, detail = '') { signals.push({ type, points, detail }); }

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
  const score = clampScore(signals.reduce((sum, s) => sum + (s.points || 0), 0));
  return { score, signals };
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

function clampScore(score) { return Math.max(0, Math.min(100, Math.round(score))); }

function localAnalyze(message) {
  const urls = extractUrls(message).slice(0, 8);
  const scored = scoreMessage(message, urls);
  const links = urls.map(url => {
    const host = getHostname(url);
    return {
      originalUrl: url,
      normalizedUrl: url,
      finalUrl: url,
      hostname: host,
      redirectChain: [url],
      httpStatus: null,
      https: url.startsWith('https://'),
      backendChecked: false,
      checks: {
        shortener: shorteners.includes(host), suspiciousTld: suspiciousTlds.some(tld => host.endsWith(tld)), punycode: host.startsWith('xn--') || host.includes('.xn--'), longUrl: url.length > 120, suspiciousParams: /[?&](redirect|url|next|return|token|session|login)=/i.test(url), securityHeaders: null, googleSafeBrowsing: null, virusTotal: null
      },
      notes: ['Static mode: redirect chain, final destination after redirects, HTTP status, and security headers require Cloudflare Pages Functions.'],
      extraRisk: 0
    };
  });
  return { app:'Scam Message Checker', createdAt:new Date().toISOString(), engine:'static-fallback', score:scored.score, signals:scored.signals, links };
}

function finalizeReport(raw, lang) {
  const score = clampScore(raw.score || 0);
  const verdict = getVerdict(score, raw.links || [], lang);
  const meaning = explainMeaning(raw.signals || [], raw.links || [], lang);
  return {
    app: 'Scam Message Checker', createdAt: raw.createdAt || new Date().toISOString(), outputLanguage: lang, engine: raw.engine || 'static-fallback', score,
    verdict, confidence: calculateConfidence(raw.signals || [], raw.links || [], raw.engine), meaning, signals: raw.signals || [], links: raw.links || [], action: getAction(verdict, lang), finalDecision: verdict.openDecision
  };
}

function getVerdict(score, links, lang) {
  const dict = L(lang);
  const anyDanger = links.some(l => l.checks?.googleSafeBrowsing?.unsafe || (l.checks?.virusTotal?.malicious || 0) > 0 || (l.checks?.virusTotal?.suspicious || 0) > 0 || l.checks?.customBlacklist);
  if (anyDanger || score >= 76) return { label: dict.dangerous, className: 'danger', openDecision: dict.openDanger };
  if (score >= 46) return { label: dict.high, className: 'danger', openDecision: dict.openHigh };
  if (score >= 26) return { label: dict.suspicious, className: 'warn', openDecision: dict.openSuspicious };
  return { label: dict.low, className: 'safe', openDecision: dict.openLow };
}

function explainMeaning(signals, links, lang) {
  const dict = L(lang);
  const categories = new Set(signals.map(s => s.type));
  const parts = [];
  ['delivery','credentials','payment','threat','prize','job','government'].forEach(k => { if (categories.has(k)) parts.push(dict.meaning[k]); });
  if (!parts.length) parts.push(dict.meaningDefault);
  if (links.length) parts.push(dict.linksFound(links.length));
  return parts.join(' ');
}

function getAction(verdict, lang) {
  const dict = L(lang);
  if (verdict.className === 'danger') return dict.actionDanger;
  if (verdict.className === 'warn') return dict.actionWarn;
  return dict.actionLow;
}

function calculateConfidence(signals, links, engine) {
  let c = 40;
  c += Math.min(30, signals.length * 5);
  if (links.length) c += 10;
  if (engine === 'cloudflare-functions') c += 15;
  if (links.some(l => l.checks?.googleSafeBrowsing || l.checks?.virusTotal)) c += 15;
  return Math.max(30, Math.min(95, c));
}

async function analyze() {
  const message = $('messageInput').value.trim();
  const outputLanguage = $('languageSelect').value;
  if (!message) { alert('Paste a suspicious message or link first.'); return; }
  $('analyzeBtn').disabled = true;
  $('analyzeBtn').textContent = 'Analyzing...';
  $('engineMode').textContent = 'Checking...';
  $('engineMode').className = 'badge neutral';
  try {
    const res = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message, messageType: $('messageType').value }) });
    if (!res.ok) throw new Error('Backend not available');
    const raw = await res.json();
    lastReport = finalizeReport(raw, outputLanguage);
  } catch {
    lastReport = finalizeReport(localAnalyze(message), outputLanguage);
  } finally {
    $('analyzeBtn').disabled = false;
    $('analyzeBtn').textContent = 'Analyze Now';
  }
  renderReport(lastReport);
}

function renderReport(report) {
  const score = Math.round(report.score || 0);
  const badgeClass = report.verdict.className || 'neutral';
  $('demoScore').textContent = score;
  $('engineMode').textContent = report.engine === 'cloudflare-functions' ? 'Cloudflare Backend' : 'Static Fallback';
  $('engineMode').className = `badge ${report.engine === 'cloudflare-functions' ? 'safe' : 'warn'}`;
  $('resultSummary').innerHTML = `
    <div class="verdict-card">
      <span class="badge ${badgeClass}">${escapeHtml(report.verdict.label)}</span>
      <div class="verdict-big">${escapeHtml(report.verdict.openDecision)}</div>
      <div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div>
      <div class="kv">
        <div class="kv-row"><strong>Risk Score</strong><span>${score}/100</span></div>
        <div class="kv-row"><strong>Confidence</strong><span>${escapeHtml(report.confidence)}%</span></div>
        <div class="kv-row"><strong>Links Found</strong><span>${report.links.length}</span></div>
      </div>
    </div>`;
  $('detailsSection').hidden = false;
  $('meaningBox').innerHTML = `<p>${escapeHtml(report.meaning)}</p>`;
  const dict = L(report.outputLanguage);
  $('signalsList').innerHTML = report.signals.length ? report.signals.map(s => `<li><strong>+${s.points}</strong> ${escapeHtml(dict.signal(s))}</li>`).join('') : `<li>${escapeHtml(dict.noSignal)}</li>`;
  $('linksBox').innerHTML = report.links.length ? report.links.map(renderLinkCard).join('') : `<p>${escapeHtml(dict.noUrl)}</p>`;
  $('actionBox').innerHTML = `<ul class="clean-list">${report.action.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`;
}

function renderLinkCard(link, index) {
  const headers = link.checks?.securityHeaders;
  const vt = link.checks?.virusTotal;
  const gsb = link.checks?.googleSafeBrowsing;
  const headerText = headers ? `${headers.present?.length || 0} present, ${headers.missing?.length || 0} missing` : 'Not checked';
  const vtText = vt ? (vt.error ? `Error: ${vt.error}` : `malicious ${vt.malicious || 0}, suspicious ${vt.suspicious || 0}`) : 'API key not configured';
  const gsbText = gsb ? (gsb.error ? `Error: ${gsb.error}` : (gsb.unsafe ? 'Unsafe match found' : 'No unsafe match found')) : 'API key not configured';
  return `
    <div class="link-card">
      <h3>Link ${index + 1}</h3>
      <div class="kv">
        <div class="kv-row"><strong>Original URL</strong><span>${escapeHtml(link.originalUrl)}</span></div>
        <div class="kv-row"><strong>Final URL</strong><span>${escapeHtml(link.finalUrl || link.normalizedUrl)}</span></div>
        <div class="kv-row"><strong>Website / Host</strong><span>${escapeHtml(link.hostname || 'Unknown')}</span></div>
        <div class="kv-row"><strong>HTTPS</strong><span class="${link.https ? 'good' : 'bad'}">${link.https ? 'Yes' : 'No'}</span></div>
        <div class="kv-row"><strong>Redirect Chain</strong><span>${(link.redirectChain || []).map(escapeHtml).join(' → ') || 'Not available'}</span></div>
        <div class="kv-row"><strong>HTTP Status</strong><span>${escapeHtml(link.httpStatus || 'Not checked')}</span></div>
        <div class="kv-row"><strong>Security Headers</strong><span>${escapeHtml(headerText)}</span></div>
        <div class="kv-row"><strong>Google Safe Browsing</strong><span>${escapeHtml(gsbText)}</span></div>
        <div class="kv-row"><strong>VirusTotal</strong><span>${escapeHtml(vtText)}</span></div>
        <div class="kv-row"><strong>Notes</strong><span>${escapeHtml((link.notes || []).join(' | ') || 'No notes')}</span></div>
      </div>
    </div>`;
}

function formatReportText(report) {
  const dict = L(report.outputLanguage);
  return `Scam Message Checker Report\nVerdict: ${report.verdict.label}\nOpen Decision: ${report.verdict.openDecision}\nRisk Score: ${report.score}/100\nConfidence: ${report.confidence}%\nMeaning: ${report.meaning}\nSignals:\n${report.signals.map(s => '- ' + dict.signal(s) + ' (+' + s.points + ')').join('\n') || '- None'}\nLinks:\n${report.links.map(l => '- ' + (l.finalUrl || l.normalizedUrl)).join('\n') || '- None'}\nActions:\n${report.action.map(a => '- ' + a).join('\n')}`;
}
function copyReport() { if (!lastReport) return alert('Analyze first.'); navigator.clipboard.writeText(formatReportText(lastReport)).then(() => alert('Report copied.')); }
function downloadJson() { if (!lastReport) return alert('Analyze first.'); const blob = new Blob([JSON.stringify(lastReport, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `scam-message-report-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }
function clearAll() { $('messageInput').value = ''; lastReport = null; $('resultSummary').innerHTML = 'Paste a message and click Analyze Now.'; $('detailsSection').hidden = true; $('engineMode').textContent = 'Not scanned'; $('engineMode').className = 'badge neutral'; $('demoScore').textContent = '?'; }

$('analyzeBtn').addEventListener('click', analyze);
$('clearBtn').addEventListener('click', clearAll);
$('copyBtn').addEventListener('click', copyReport);
$('printBtn').addEventListener('click', () => window.print());
$('downloadJsonBtn').addEventListener('click', downloadJson);
$('shareBtn').addEventListener('click', copyReport);
renderFeatureGrid();
