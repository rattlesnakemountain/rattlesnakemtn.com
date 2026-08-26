// Cloudflare Web Analytics: a cookieless beacon that counts page views,
// referrers and country. It sets no cookies and stores no per-visitor
// identifier, which is why the privacy policy stays short.
//
// The token is public by design (it ships in the page source), but it is fed
// in at build time so local development and forks never report to the real
// property. Unset means no script and no tracking at all.
const TOKEN = import.meta.env.VITE_CF_BEACON_TOKEN;

export function initAnalytics() {
  if (!TOKEN) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.dataset.cfBeacon = JSON.stringify({ token: TOKEN });
  document.head.appendChild(script);
}
