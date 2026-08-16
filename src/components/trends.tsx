import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { metricWindow, type Snapshot, type WindowName } from "@/lib/snapshot";
import { cToF1, hPaToInHg, mmToInches, msToMph, seaLevelHPa } from "@/lib/units";
import { dayHourLabel, dayLabel, hourLabel, relativeAge } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Section } from "./section";

interface MetricDef {
  key: string;
  label: string;
  unit: string;
  convert: (v: number) => number;
  kind: "band" | "bars";
}

const METRICS: MetricDef[] = [
  { key: "temperature", label: "Temperature", unit: "°F", convert: cToF1, kind: "band" },
  { key: "humidity", label: "Humidity", unit: "%", convert: (v) => Math.round(v), kind: "band" },
  { key: "pressure", label: "Pressure", unit: "inHg", convert: hPaToInHg, kind: "band" },
  { key: "wind_speed", label: "Wind", unit: "mph", convert: msToMph, kind: "band" },
  { key: "dew_point", label: "Dew point", unit: "°F", convert: cToF1, kind: "band" },
  { key: "uv_index", label: "UV", unit: "", convert: (v) => Math.round(v * 10) / 10, kind: "band" },
  { key: "solar_radiation", label: "Solar", unit: "W/m²", convert: (v) => Math.round(v), kind: "band" },
  { key: "rain", label: "Rain", unit: "in", convert: mmToInches, kind: "bars" },
];

const RANGES: { key: WindowName; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
];

function Picker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.key}
          role="tab"
          aria-selected={o.key === value}
          onClick={() => onChange(o.key)}
          className={cn(
            "font-mono rounded-full px-3 py-1 text-[11px] tracking-wide transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)",
            o.key === value
              ? "bg-(--fg) text-(--bg)"
              : "text-(--fg-2) hover:bg-(--bg-2)"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

interface ChartTooltipPayload {
  payload?: { time: string; min?: number; max?: number; avg?: number; sum?: number };
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
      {metric.kind === "bars" ? (
        <p className="font-mono mt-1 text-xs">
          {point.sum} {metric.unit}
        </p>
      ) : (
        <p className="font-mono mt-1 text-xs">
          {point.avg} {metric.unit}
          <span className="ml-2 text-(--muted)">
            {point.min}–{point.max}
          </span>
        </p>
      )}
    </div>
  );
}

export function Trends({ snapshot }: { snapshot: Snapshot | null }) {
  const [metricKey, setMetricKey] = useState("temperature");
  const [range, setRange] = useState<WindowName>("24h");
  const metric = METRICS.find((m) => m.key === metricKey) ?? METRICS[0];

  const data = useMemo(() => {
    const points = metricWindow(snapshot, metric.key, range);

    // Pressure buckets are corrected to sea level with each bucket's own
    // average temperature, matching the Conditions readout.
    const tempByTime =
      metric.key === "pressure"
        ? new Map(
            metricWindow(snapshot, "temperature", range).map((p) => [p.time, p.avg])
          )
        : null;
    const convert = (v: number, time: string) =>
      tempByTime
        ? hPaToInHg(seaLevelHPa(v, tempByTime.get(time) ?? 10))
        : metric.convert(v);

    return points.map((p) => ({
      time: p.time,
      min: convert(p.min, p.time),
      max: convert(p.max, p.time),
      band: [convert(p.min, p.time), convert(p.max, p.time)],
      avg: convert(p.avg, p.time),
      sum: convert(p.sum, p.time),
    }));
  }, [snapshot, metric, range]);

  const tickFormatter = (iso: string) =>
    range === "24h" ? hourLabel(iso) : dayLabel(iso);

  return (
    <Section
      label="Trends"
      age={
        snapshot ? `computed ${relativeAge(snapshot.generated_at)}` : undefined
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Picker
          options={METRICS.map((m) => ({ key: m.key, label: m.label }))}
          value={metric.key}
          onChange={setMetricKey}
        />
        <Picker options={RANGES} value={range} onChange={setRange} />
      </div>

      <div className="mt-5 h-64 w-full sm:h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-xs text-(--fg-2)">
              {snapshot ? "No readings in this window yet." : "Loading…"}
            </p>
          </div>
        ) : metric.kind === "bars" ? (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
              <XAxis
                dataKey="time"
                tickFormatter={tickFormatter}
                tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "var(--line)" }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<ChartTooltip metric={metric} range={range} />}
                cursor={{ fill: "var(--bg-2)" }}
              />
              <Bar dataKey="sum" fill="var(--chart-1)" radius={[3, 3, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
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
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<ChartTooltip metric={metric} range={range} />}
                cursor={{ stroke: "var(--line)" }}
              />
              {/* Daily spread as a quiet band; the average carries the line. */}
              <Area
                dataKey="band"
                stroke="none"
                fill="var(--chart-1)"
                fillOpacity={0.12}
                isAnimationActive={false}
              />
              <Area
                dataKey="avg"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="none"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Section>
  );
}
