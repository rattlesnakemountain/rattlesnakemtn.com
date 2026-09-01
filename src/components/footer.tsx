import { cn } from "@/lib/utils";

// `width` follows the column of whatever page it sits under: the instrument
// panel is wide, the legal pages are set narrower for reading.
export function Footer({ width = "max-w-5xl" }: { width?: string }) {
  return (
    <footer
      className={cn(
        "mx-auto mt-16 w-full border-t hairline px-5 py-8",
        width
      )}
    >
      <p className="text-[13px] leading-relaxed text-(--fg-2)">
        A WeatherFlow Tempest station and camera on a radio tower on
        Rattlesnake Mountain, Washington. Readings publish to a public data
        feed every five minutes; snowpack comes from nearby USDA SNOTEL sites
        and the forecast from the National Weather Service.
      </p>
      <p className="font-mono mt-4 text-[11px] tracking-wide text-(--muted)">
        <a
          className="hover:text-(--accent)"
          href="https://storage.googleapis.com/rm-main-p-hj56-tempest-weather/v1/snapshot.json"
        >
          DATA FEED
        </a>
        <span className="mx-2">·</span>
        <a
          className="hover:text-(--accent)"
          href="https://github.com/michaelpeterswa/tempest-influxdb"
        >
          SOURCE
        </a>
        <span className="mx-2">·</span>
        <a className="hover:text-(--accent)" href="https://cam.rattlesnakemtn.com/">
          CAMERA
        </a>
        <span className="mx-2">·</span>
        <a className="hover:text-(--accent)" href="/privacy/">
          PRIVACY
        </a>
        <span className="mx-2">·</span>
        <a className="hover:text-(--accent)" href="/terms/">
          TERMS
        </a>
      </p>
    </footer>
  );
}
