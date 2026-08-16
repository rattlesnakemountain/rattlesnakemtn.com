import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSnotel, type SnotelStation } from "@/lib/snotel";
import { dayHourLabel, dayLabel, relativeAge } from "@/lib/time";
import { Section } from "./section";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

interface MergedPoint {
  date: string;
  [triplet: string]: string | number | undefined;
}

function merge(stations: SnotelStation[]): MergedPoint[] {
  const byDate = new Map<string, MergedPoint>();
  for (const station of stations) {
    for (const point of station.data) {
      const entry = byDate.get(point.date) ?? { date: point.date };
      entry[station.triplet] = point.value;
      byDate.set(point.date, entry);
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : 1
  );
}

interface SnotelTooltipItem {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
}

function SnotelTooltip({
  active,
  payload,
  label,
  stations,
}: {
  active?: boolean;
  payload?: SnotelTooltipItem[];
  label?: string;
  stations: SnotelStation[];
}) {
  if (!active || !payload || payload.length === 0 || !label) return null;
  return (
    <div className="rounded-md border hairline bg-(--bg) px-3 py-2 shadow-sm">
      <p className="font-mono text-[11px] text-(--fg-2)">{dayHourLabel(label)}</p>
      {payload.map((item) => {
        const station = stations.find((s) => s.triplet === item.dataKey);
        return (
          <p key={String(item.dataKey)} className="font-mono mt-1 flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {station?.name ?? item.dataKey}: {item.value} in
          </p>
        );
      })}
    </div>
  );
}

export function SnotelSection() {
  const { stations, error } = useSnotel();
  const data = useMemo(() => (stations ? merge(stations) : []), [stations]);
  const lastReport = stations?.flatMap((s) => s.data.at(-1)?.date ?? []).sort().at(-1);

  return (
    <Section
      label="Snowpack · nearby SNOTEL sites"
      age={lastReport ? `reported ${relativeAge(lastReport)}` : undefined}
    >
      {error ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">
          The USDA SNOTEL service is not answering right now.
        </p>
      ) : stations === null ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">Loading snow depths…</p>
      ) : (
        <>
          {/* Direct labels: name, place, and the current depth per site. */}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            {stations.map((station, i) => (
              <div key={station.triplet} className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[i] }}
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[13px]">
                    {station.name}
                    <span className="ml-1.5 text-(--muted)">{station.detail}</span>
                  </dt>
                  <dd className="font-mono mt-0.5 text-lg tracking-tight">
                    {station.latest ?? "—"}
                    <span className="ml-1 text-[13px] text-(--muted)">in</span>
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-5 h-48 w-full">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={dayLabel}
                  tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={{ stroke: "var(--line)" }}
                  tickLine={false}
                  minTickGap={60}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  content={<SnotelTooltip stations={stations} />}
                  cursor={{ stroke: "var(--line)" }}
                />
                {stations.map((station, i) => (
                  <Line
                    key={station.triplet}
                    dataKey={station.triplet}
                    stroke={SERIES_COLORS[i]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Section>
  );
}
