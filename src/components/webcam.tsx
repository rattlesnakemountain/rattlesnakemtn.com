import { useEffect, useState } from "react";

const CAM_URL = "https://cam.rattlesnakemtn.com/latest.jpg";
const REFRESH_MS = 5 * 60 * 1000;

// The camera publishes a new annotated frame every few minutes; the query
// param defeats any cache in the path so a reload always shows the newest one.
function bustedUrl(): string {
  return `${CAM_URL}?t=${Date.now()}`;
}

export function Webcam() {
  const [src, setSrc] = useState(bustedUrl);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSrc(bustedUrl());
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <figure className="mx-auto w-full max-w-5xl px-5">
      <div className="overflow-hidden rounded-md bg-(--bg-2)">
        {failed ? (
          <div className="flex aspect-video items-center justify-center">
            <p className="font-mono text-xs text-(--fg-2)">
              Camera unreachable — it will retry on the next cycle.
            </p>
          </div>
        ) : (
          <img
            src={src}
            alt="Live view from the Rattlesnake Mountain webcam, with current conditions annotated on the frame"
            className="w-full"
            fetchPriority="high"
            onLoad={() => {
              setLoadedAt(new Date());
              setFailed(false);
            }}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption className="mt-2.5 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full bg-(--live)"
          aria-hidden="true"
        />
        <span className="eyebrow">Live from the tower</span>
        {loadedAt && (
          <span className="font-mono ml-auto text-[11px] text-(--muted)">
            frame fetched{" "}
            {loadedAt.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
