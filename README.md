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
  [rattlecam](https://cam.rattlesnakemtn.com/latest.jpg), fetched with a
  cache-busting query and refreshed every five minutes.
- **Snowpack** — the three nearest USDA SNOTEL sites, straight from the AWDB
  REST API.
- **Forecast** — the mountain's NWS gridpoint, straight from api.weather.gov.

All four are fetched from the visitor's browser; the tower only ever uploads.

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
