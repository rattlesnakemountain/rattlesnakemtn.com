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
