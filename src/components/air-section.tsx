import { useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  aqiMetricLast,
  aqiMetricWindow,
  aqiWindow,
  useAqiSnapshot,
  type AqiSnapshot,
  type AqiWindowPoint,
} from "@/lib/aqi";
import type { WindowName } from "@/lib/snapshot";
import { dayHourLabel, dayLabel, hourLabel, isStale, relativeAge } from "@/lib/time";
import { Picker } from "./picker";
import { Section } from "./section";

// The readings a visitor cares about, in tile and picker order. The monitor
// also reports its own temperature and humidity, but the station's are the
// ones this page stands by, so those stay out. `aqi` is not a metric key in
// the snapshot; it is handled by aqiWindow.
interface MetricDef {
  key: string;
  label: string;
  unit: string;
  convert: (v: number) => number;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

const METRICS: MetricDef[] = [
  { key: "aqi", label: "AQI", unit: "", convert: Math.round },
  { key: "pm25", label: "PM2.5", unit: "µg/m³", convert: round1 },
  { key: "pm100", label: "PM10", unit: "µg/m³", convert: round1 },
  { key: "co2", label: "CO₂", unit: "ppm", convert: Math.round },
  { key: "tvoc_index", label: "VOC index", unit: "", convert: Math.round },
  { key: "nox_index", label: "NOx index", unit: "", convert: Math.round },
];

const RANGES: { key: WindowName; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
];

interface Reading {
  label: string;
  value: string;
  unit: string;
}

function readings(snapshot: AqiSnapshot): Reading[] {
  const list: Reading[] = [];

  // The index leads, with its category and the pollutant behind it standing
  // in for a unit: "42 Good · PM2.5" reads as one fact.
  const aqi = snapshot.aqi.last;
  if (aqi) {
    list.push({
      label: "Air quality index",
      value: `${aqi.aqi}`,
      unit: `${aqi.level} · ${aqi.primary_pollutant}`,
    });
  }

  for (const metric of METRICS) {
    if (metric.key === "aqi") continue;
    const last = aqiMetricLast(snapshot, metric.key)?.last;
    if (last === undefined) continue;
    list.push({ label: metric.label, value: `${metric.convert(last)}`, unit: metric.unit });
  }

  return list;
}

interface ChartTooltipPayload {
  payload?: { time: string; min: number; max: number; avg: number };
}

function ChartTooltip({
  active,
  payload,
  metric,
  range,
}: {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  metric: MetricDef;
  range: WindowName;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-md border hairline bg-(--bg) px-3 py-2 shadow-sm">
      <p className="font-mono text-[11px] text-(--fg-2)">
        {range === "24h" ? dayHourLabel(point.time) : dayLabel(point.time)}
      </p>
      <p className="font-mono mt-1 text-xs">
        {point.avg} {metric.unit}
        <span className="ml-2 text-(--muted)">
          {point.min}–{point.max}
        </span>
      </p>
    </div>
  );
}

export function AirSection() {
  const { snapshot, error } = useAqiSnapshot();
  const [metricKey, setMetricKey] = useState("aqi");
  const [range, setRange] = useState<WindowName>("24h");
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  const reported = snapshot?.aqi.last?.time ?? aqiMetricLast(snapshot, "pm25")?.time;
  const stale = snapshot !== null && isStale(reported);

  const data = useMemo(() => {
    const points: AqiWindowPoint[] =
      metric.key === "aqi"
        ? aqiWindow(snapshot, range)
        : aqiMetricWindow(snapshot, metric.key, range);
    return points.map((p) => ({
      time: p.time,
      min: metric.convert(p.min),
      max: metric.convert(p.max),
      band: [metric.convert(p.min), metric.convert(p.max)],
      avg: metric.convert(p.avg),
    }));
  }, [snapshot, metric, range]);

  const tickFormatter = (iso: string) =>
    range === "24h" ? hourLabel(iso) : dayLabel(iso);

  return (
    <Section
      label="Air quality"
      age={
        snapshot === null
          ? undefined
          : stale
            ? `stale — last report ${relativeAge(reported)}`
            : `reported ${relativeAge(reported)}`
      }
    >
      {error ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">
          The air quality feed is not answering right now.
        </p>
      ) : snapshot === null ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">Loading the latest reading…</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
            {readings(snapshot).map((r) => (
              <div key={r.label}>
                <dt className="text-[13px] text-(--fg-2)">{r.label}</dt>
                <dd className="font-mono mt-1 text-xl tracking-tight">
                  {r.value}
                  {r.unit && (
                    <span className="ml-1 text-[13px] text-(--muted)">{r.unit}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Picker
              options={METRICS.map((m) => ({ key: m.key, label: m.label }))}
              value={metric.key}
              onChange={setMetricKey}
              label="Metric"
            />
            <Picker
              options={RANGES}
              value={range}
              onChange={setRange}
              label="Time range"
            />
          </div>

          <div className="mt-5 h-56 w-full sm:h-64">
            {data.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="font-mono text-xs text-(--fg-2)">
                  No readings in this window yet.
                </p>
              </div>
            ) : (
              <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
                  <XAxis
                    dataKey="time"
                    tickFormatter={tickFormatter}
                    tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "var(--line)" }}
                    tickLine={false}
                    minTickGap={40}
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    content={<ChartTooltip metric={metric} range={range} />}
                    cursor={{ stroke: "var(--line)" }}
                  />
                  {/* Spread as a quiet band; the average carries the line. */}
                  <Area
                    dataKey="band"
                    stroke="none"
                    fill="var(--chart-3)"
                    fillOpacity={0.12}
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="avg"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    fill="none"
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </Section>
  );
}
