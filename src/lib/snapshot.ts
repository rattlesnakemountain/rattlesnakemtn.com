// The station's data comes from one precomputed snapshot in a public bucket,
// republished every five minutes by the tower. One fetch hydrates the page.
// See https://github.com/michaelpeterswa/tempest-influxdb-api

import { useEffect, useState } from "react";

const SNAPSHOT_URL =
  "https://storage.googleapis.com/rm-main-p-hj56-tempest-weather/v1/snapshot.json";

const REFRESH_MS = 5 * 60 * 1000;

export interface LastReading {
  time: string;
  last: number;
}

export interface WindowPoint {
  time: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
}

export type WindowName = "12h" | "24h" | "7d" | "30d" | "90d";

export interface MetricSnapshot {
  last?: LastReading;
  windows: Record<WindowName, WindowPoint[]>;
}

export interface Snapshot {
  generated_at: string;
  metrics: Record<string, MetricSnapshot>;
}

export interface SnapshotState {
  snapshot: Snapshot | null;
  error: boolean;
}

// useSnapshot fetches the bucket snapshot and refreshes it on the publish
// cadence. The bucket serves max-age=60, so refreshes are cheap.
export function useSnapshot(): SnapshotState {
  const [state, setState] = useState<SnapshotState>({
    snapshot: null,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(SNAPSHOT_URL);
        if (!res.ok) throw new Error(`snapshot ${res.status}`);
        const snapshot = (await res.json()) as Snapshot;
        if (!cancelled) setState({ snapshot, error: false });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, error: s.snapshot === null }));
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return state;
}

export function metricLast(
  snapshot: Snapshot | null,
  metric: string
): LastReading | null {
  return snapshot?.metrics[metric]?.last ?? null;
}

export function metricWindow(
  snapshot: Snapshot | null,
  metric: string,
  window: WindowName
): WindowPoint[] {
  return snapshot?.metrics[metric]?.windows?.[window] ?? [];
}
