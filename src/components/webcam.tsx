import { useEffect, useRef, useState } from "react";
import { clockTime } from "@/lib/time";

const CAM_URL = "https://cam.rattlesnakemtn.com/latest-web.jpg";

// The camera publishes a new frame every ten minutes.
const REFRESH_MS = 10 * 60 * 1000;

// The host serves each frame `no-cache, must-revalidate` behind an ETag, so
// re-fetching the bare URL costs a revalidation — a few hundred bytes — while
// the frame is unchanged. A cache-busting query string throws that away and
// makes every refresh a full transfer. Instead we poll `Last-Modified` with a
// HEAD and put a stamp on the URL only once the camera has published a new
// frame, which is also the honest time to show in the caption.
function frameUrl(stamp: string | null): string {
  return stamp === null ? CAM_URL : `${CAM_URL}?v=${encodeURIComponent(stamp)}`;
}

export function Webcam() {
  const [stamp, setStamp] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // The `Last-Modified` of the frame currently on screen. The first poll only
  // records it: the browser already has that frame from the bare URL.
  const shown = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      let lastModified: string | null = null;
      try {
        const res = await fetch(CAM_URL, { method: "HEAD", cache: "no-cache" });
        if (!res.ok) return;
        lastModified = res.headers.get("Last-Modified");
      } catch {
        // The frame on screen stays; the next cycle tries again.
        return;
      }
      if (cancelled || lastModified === null) return;

      setCapturedAt(new Date(lastModified).toISOString());
      if (shown.current !== null && shown.current !== lastModified) {
        setStamp(lastModified);
      }
      shown.current = lastModified;
    }

    poll();
    const timer = setInterval(poll, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
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
            src={frameUrl(stamp)}
            alt="Live view from the Rattlesnake Mountain webcam, with current conditions annotated on the frame"
            className="w-full"
            fetchPriority="high"
            onLoad={() => setFailed(false)}
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
        {capturedAt && (
          <span className="font-mono ml-auto text-[11px] text-(--muted)">
            captured {clockTime(capturedAt)}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
