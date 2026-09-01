# rattlesnakemtn.com

The public face of the weather station and webcam on Rattlesnake Mountain,
Washington. A fully static site (Vite + React + Tailwind) deployed to GitHub
Pages — there is no server component.

## Where the data comes from

- **Station readings** — one fetch of a precomputed snapshot from a public GCS
  bucket, republished every five minutes by the tower:
  `https://storage.googleapis.com/rm-main-p-hj56-tempest-weather/v1/snapshot.json`
  (produced by [tempest-influxdb-api](https://github.com/michaelpeterswa/tempest-influxdb-api)'s
  `publish` command). Every object carries a `generated_at` stamp, which drives
  the recency labels.
- **Webcam** — the annotated frame from
  [rattlecam](https://cam.rattlesnakemtn.com/). The host serves each frame
  `no-cache, must-revalidate` behind an `ETag`, so the page fetches
  `latest-web.jpg` (the web-sized cut, ~220 kB against 1.3 MB for the
  full-resolution one) with **no query string**: an unchanged frame then costs
  a revalidation of a few hundred bytes instead of a full transfer. To know
  when a new frame exists, it polls `Last-Modified` with a HEAD on the
  camera's ten-minute publish cadence and stamps the URL only then — which is
  also where the caption's capture time comes from. Do not reintroduce a
  cache-busting parameter; it makes every refresh a full download.
- **Timelapse** — the `latest-{today,yesterday,weekly,monthly}[-daylight].mp4`
  clips from the same host, in a `<video>` with `preload="metadata"` so the
  heavier cuts (26.8 MB weekly, 52.1 MB monthly) cost nothing until someone
  presses play. The host publishes no manifest, so the set is listed in
  `src/components/timelapse.tsx`; each clip's weight and build time come from
  a HEAD of the file itself rather than a hardcoded table. Note that
  `latest-monthly` has no `-daylight` companion — night is already dropped
  when it is assembled — so the lighting picker is hidden for that period.
  The host also offers a GIF of every clip; they are larger and lower
  resolution than the MP4s, and exist for `<img>`-only embedding.
- **Snowpack** — the three nearest USDA SNOTEL sites, straight from the AWDB
  REST API.
- **Forecast** — the mountain's NWS gridpoint, straight from api.weather.gov.

All of these are fetched from the visitor's browser; the tower only ever
uploads.

## Analytics

Page-view counting is [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/):
one cookieless beacon, no per-visitor identifier, aggregate page views,
referrers and country only. It is opt-in at build time via
`VITE_CF_BEACON_TOKEN` — unset (local dev, forks, PR previews) means the
beacon is dead-code-eliminated and nothing is reported. Production gets the
token from the `CF_BEACON_TOKEN` repository variable in
`.github/workflows/deploy_pages.yml`.

To wire it up: add the site in the Cloudflare dashboard under
**Web Analytics**, copy the token out of the snippet it hands you, and set it
as a repository variable (Settings → Secrets and variables → Actions →
Variables). No Cloudflare DNS or proxying required — this works on GitHub
Pages as-is.

`/privacy/` and `/terms/` describe this behavior and must be kept honest if
the analytics ever change.

## License

The [MIT License](LICENSE) covers the source code. It does not cover the site
content — the text, the design, the icons, and the camera imagery — which stays
with the site operator, as `/terms/` states.

## Development

```console
$ bun install
$ bun run dev
```

The dev server reads the real public bucket, camera, SNOTEL, and NWS — no
local infrastructure needed.

## Deployment

Pushes to `main` build and deploy to GitHub Pages
(`.github/workflows/deploy_pages.yml`). The custom domain is set by
`public/CNAME`.

The build has three entries — `index.html`, `privacy/index.html` and
`terms/index.html` — so the legal pages ship as real static files at `/privacy/`
and `/terms/`, with no single-page-app 404 fallback needed.
