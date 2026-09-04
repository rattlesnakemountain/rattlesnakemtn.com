// Air quality comes from a second snapshot in the same bucket, published every
// five minutes from the AirGradient monitor's readings and the EPA index
// computed from them. See https://github.com/michaelpeterswa/aqi-api
//
// Its shape mirrors the station snapshot (metrics keyed by name, each with a
// last reading and bucketed windows) with two differences: window points
// carry no sum, and a top-level `aqi` block holds the index itself.

import { useEffect, useState } from "react";
import type { LastReading, WindowName } from "./snapshot";

const AQI_SNAPSHOT_URL =
  "https://storage.googleapis.com/rm-main-p-hj56-tempest-weather/aqi/v1/snapshot.json";

const REFRESH_MS = 5 * 60 * 1000;

export interface AqiWindowPoint {
  time: string;
  min: number;
  max: number;
  avg: number;
}

export interface AqiMetricSnapshot {
  last?: LastReading;
  windows: Record<WindowName, AqiWindowPoint[]>;
}

// The index at one moment: the EPA value, its category name, and which
// pollutant produced it.
export interface AqiLast {
  time: string;
  aqi: number;
  level: string;
  primary_pollutant: string;
}

// One bucket of the index series. `aqi` is the bucket's mean index rounded,
// `level` the category of that mean, `primary_pollutant` the bucket's most
// frequent value.
export interface AqiPoint extends AqiLast {
  min: number;
  max: number;
}

export interface AqiSnapshot {
  generated_at: string;
  metrics: Record<string, AqiMetricSnapshot>;
  aqi: {
    last?: AqiLast;
    windows: Record<WindowName, AqiPoint[]>;
  };
}

export interface AqiSnapshotState {
  snapshot: AqiSnapshot | null;
  error: boolean;
}

// useAqiSnapshot mirrors useSnapshot: fetch, refresh on the publish cadence,
// and keep the last good data through a failed refresh.
export function useAqiSnapshot(): AqiSnapshotState {
  const [state, setState] = useState<AqiSnapshotState>({
    snapshot: null,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(AQI_SNAPSHOT_URL);
        if (!res.ok) throw new Error(`aqi snapshot ${res.status}`);
        const snapshot = (await res.json()) as AqiSnapshot;
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

export function aqiMetricLast(
  snapshot: AqiSnapshot | null,
  metric: string
): LastReading | null {
  return snapshot?.metrics[metric]?.last ?? null;
}

export function aqiMetricWindow(
  snapshot: AqiSnapshot | null,
  metric: string,
  window: WindowName
): AqiWindowPoint[] {
  return snapshot?.metrics[metric]?.windows?.[window] ?? [];
}

// aqiWindow returns the index series in the same min/max/avg shape as a
// metric window, so one chart draws both.
export function aqiWindow(
  snapshot: AqiSnapshot | null,
  window: WindowName
): AqiWindowPoint[] {
  return (snapshot?.aqi.windows?.[window] ?? []).map((p) => ({
    time: p.time,
    min: p.min,
    max: p.max,
    avg: p.aqi,
  }));
}
