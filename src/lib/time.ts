// Times render in the mountain's own timezone: this is a place, not a session.
const TZ = "America/Los_Angeles";

export function relativeAge(iso: string | undefined, now = Date.now()): string {
  if (!iso) return "no data";
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((now - then) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours === 1) return "1 hr ago";
  if (hours < 48) return `${hours} hrs ago`;
  return `${Math.round(hours / 24)} days ago`;
}

// Stale when the reading is older than three publish cycles.
export function isStale(iso: string | undefined, now = Date.now()): boolean {
  if (!iso) return true;
  return now - new Date(iso).getTime() > 20 * 60 * 1000;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function hourLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
  });
}

export function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
  });
}

export function dayHourLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}
