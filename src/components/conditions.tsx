import { metricLast, type Snapshot } from "@/lib/snapshot";
import {
  cToF1,
  degreesToCardinal,
  hPaToInHg,
  kmToMiles,
  mmToInches,
  msToMph,
  seaLevelHPa,
} from "@/lib/units";
import { isStale, relativeAge } from "@/lib/time";
import { Section } from "./section";

interface Reading {
  label: string;
  value: string;
  unit: string;
}

function readings(snapshot: Snapshot): Reading[] {
  const last = (metric: string) => metricLast(snapshot, metric)?.last;
  const list: Reading[] = [];

  const temp = last("temperature");
  if (temp !== undefined) list.push({ label: "Temperature", value: `${cToF1(temp)}`, unit: "°F" });

  const wind = last("wind_speed");
  const dir = last("wind_direction");
  if (wind !== undefined) {
    const mph = msToMph(wind);
    list.push({
      label: "Wind",
      value: `${mph}`,
      // A direction on calm air is noise, so it only shows when there is wind.
      unit: mph > 0 && dir !== undefined ? `mph ${degreesToCardinal(dir)}` : "mph",
    });
  }

  const gust = last("wind_gust");
  if (gust !== undefined) list.push({ label: "Gust", value: `${msToMph(gust)}`, unit: "mph" });

  const humidity = last("humidity");
  if (humidity !== undefined) list.push({ label: "Humidity", value: `${Math.round(humidity)}`, unit: "%" });

  const dew = last("dew_point");
  if (dew !== undefined) list.push({ label: "Dew point", value: `${cToF1(dew)}`, unit: "°F" });

  const pressure = last("pressure");
  if (pressure !== undefined && temp !== undefined)
    list.push({ label: "Pressure", value: `${hPaToInHg(seaLevelHPa(pressure, temp))}`, unit: "inHg" });

  const uv = last("uv_index");
  if (uv !== undefined) list.push({ label: "UV index", value: `${Math.round(uv * 10) / 10}`, unit: "" });

  const solar = last("solar_radiation");
  if (solar !== undefined) list.push({ label: "Solar", value: `${Math.round(solar)}`, unit: "W/m²" });

  // 24h rain total comes from the summed buckets, not a last reading.
  const rain24 = snapshot.metrics["rain"]?.windows?.["24h"];
  if (rain24 && rain24.length > 0) {
    const total = rain24.reduce((acc, p) => acc + p.sum, 0);
    list.push({ label: "Rain · 24h", value: `${mmToInches(total)}`, unit: "in" });
  }

  const strikes24 = snapshot.metrics["strike_count"]?.windows?.["24h"];
  if (strikes24) {
    const total = strikes24.reduce((acc, p) => acc + p.sum, 0);
    if (total > 0) {
      const dist = last("strike_distance");
      list.push({
        label: "Lightning · 24h",
        value: `${Math.round(total)}`,
        unit: dist !== undefined && dist > 0 ? `strikes · ~${kmToMiles(dist)} mi` : "strikes",
      });
    }
  }

  return list;
}

export function Conditions({ snapshot }: { snapshot: Snapshot | null }) {
  const reported = snapshot ? metricLast(snapshot, "temperature")?.time : undefined;
  const stale = snapshot !== null && isStale(reported);

  return (
    <Section
      label="Conditions"
      age={
        snapshot === null
          ? undefined
          : stale
            ? `stale — last report ${relativeAge(reported)}`
            : `reported ${relativeAge(reported)}`
      }
    >
      {snapshot === null ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">Loading the latest report…</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
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
      )}
    </Section>
  );
}
