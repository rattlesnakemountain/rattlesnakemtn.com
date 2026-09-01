import { useEffect, useRef, useState } from "react";
import { relativeAge } from "@/lib/time";
import { Picker } from "./picker";
import { Section } from "./section";

const CAM_HOST = "https://cam.rattlesnakemtn.com";

// The still frame stands in until the visitor presses play: it is the same
// view, already in cache from the camera above, and it keeps the box from
// starting as a black rectangle.
const POSTER = `${CAM_HOST}/latest-web.jpg`;

type PeriodKey = "today" | "yesterday" | "weekly" | "monthly";
type LightingKey = "all" | "daylight";

interface Period {
  key: PeriodKey;
  label: string;
  stem: string;
  // The 30-day cut is the only one with no all-hours companion: night is
  // dropped when it is assembled.
  hasLighting: boolean;
  note: string;
}

const PERIODS: Period[] = [
  {
    key: "today",
    label: "Today",
    stem: "latest-today",
    hasLighting: true,
    note: "Midnight until now, rebuilt every half hour.",
  },
  {
    key: "yesterday",
    label: "Yesterday",
    stem: "latest-yesterday",
    hasLighting: true,
    note: "The last complete day.",
  },
  {
    key: "weekly",
    label: "7 days",
    stem: "latest-weekly",
    hasLighting: true,
    note: "The last seven days, end to end.",
  },
  {
    key: "monthly",
    label: "30 days",
    stem: "latest-monthly",
    hasLighting: false,
    note:
      "The last thirty days, end to end. This cut always removes night: it " +
      "would otherwise be a third of the running time as a black frame.",
  },
];

const LIGHTING: { key: LightingKey; label: string }[] = [
  { key: "all", label: "All hours" },
  { key: "daylight", label: "Daylight only" },
];

const LIGHTING_NOTE: Record<LightingKey, string> = {
  all: "Night is included, so the changes through dawn and dusk are there.",
  daylight:
    "The hours the camera spent in infrared are removed. This is shorter, " +
    "but it skips the dawns and dusks.",
};

function clipUrl(period: Period, lighting: LightingKey): string {
  const daylight = period.hasLighting && lighting === "daylight";
  return `${CAM_HOST}/${period.stem}${daylight ? "-daylight" : ""}.mp4`;
}

// The camera host labels its own sizes on a 1024 divisor; match it so the
// numbers here agree with the ones there.
function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ClipMeta {
  bytes: number | null;
  builtAt: string | null;
}

// Weight and build time come from the file's own headers, which the host
// exposes cross-origin. A HEAD is a few hundred bytes and keeps both honest
// as the clips grow, which a hardcoded table would not.
function useClipMeta(url: string): ClipMeta | null {
  const [meta, setMeta] = useState<ClipMeta | null>(null);
  const cache = useRef(new Map<string, ClipMeta>());

  useEffect(() => {
    const cached = cache.current.get(url);
    if (cached) {
      setMeta(cached);
      return;
    }

    let cancelled = false;
    setMeta(null);

    async function head(): Promise<boolean> {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok || cancelled) return false;
        const length = res.headers.get("Content-Length");
        const modified = res.headers.get("Last-Modified");
        const next: ClipMeta = {
          bytes: length === null ? null : Number(length),
          builtAt: modified === null ? null : new Date(modified).toISOString(),
        };
        cache.current.set(url, next);
        setMeta(next);
        return true;
      } catch {
        return false;
      }
    }

    // The host answers an occasional HEAD with a 503. One retry is enough to
    // ride that out; past it the clip still plays and only the caption goes
    // without its numbers.
    let retry: ReturnType<typeof setTimeout> | undefined;
    head().then((ok) => {
      if (!ok && !cancelled) retry = setTimeout(head, 2000);
    });

    return () => {
      cancelled = true;
      clearTimeout(retry);
    };
  }, [url]);

  return meta;
}

export function Timelapse() {
  const [periodKey, setPeriodKey] = useState<PeriodKey>("today");
  const [lighting, setLighting] = useState<LightingKey>("all");
  const [failed, setFailed] = useState(false);

  const period = PERIODS.find((p) => p.key === periodKey) ?? PERIODS[0];
  const url = clipUrl(period, lighting);
  const meta = useClipMeta(url);

  useEffect(() => setFailed(false), [url]);

  return (
    <Section
      label="Timelapse"
      age={meta?.builtAt ? `built ${relativeAge(meta.builtAt)}` : undefined}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Picker
          options={PERIODS.map((p) => ({ key: p.key, label: p.label }))}
          value={period.key}
          onChange={setPeriodKey}
          label="Timelapse period"
        />
        {period.hasLighting && (
          <Picker
            options={LIGHTING}
            value={lighting}
            onChange={setLighting}
            label="Hours included"
          />
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-md bg-(--bg-2)">
        {failed ? (
          <div className="flex aspect-video items-center justify-center">
            <p className="font-mono text-xs text-(--fg-2)">
              This clip is not available right now.
            </p>
          </div>
        ) : (
          <video
            key={url}
            src={url}
            poster={POSTER}
            controls
            loop
            muted
            playsInline
            // Metadata only: the 30-day clip is fifty megabytes, and nobody
            // pays for it until they press play.
            preload="metadata"
            className="aspect-video w-full"
            onError={() => setFailed(true)}
          />
        )}
      </div>

      <div className="mt-2.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
        <p className="text-[13px] leading-relaxed text-(--fg-2)">
          {period.note}
          {period.hasLighting && ` ${LIGHTING_NOTE[lighting]}`}
        </p>
        {meta?.bytes != null && (
          <span className="font-mono shrink-0 text-[11px] text-(--muted) sm:ml-auto">
            {formatBytes(meta.bytes)}
          </span>
        )}
      </div>
    </Section>
  );
}
