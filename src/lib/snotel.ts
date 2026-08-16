// SNOTEL snow depth from the three nearest USDA sites, fetched straight from
// the AWDB REST API (it allows any origin).

import { useEffect, useState } from "react";

const STATION_TRIPLETS = "898:WA:SNTL,899:WA:SNTL,912:WA:SNTL";
const API = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1";

// The summit of Rattlesnake Mountain, for distance and bearing labels.
const REFERENCE_LAT = 47.470597;
const REFERENCE_LON = -121.825356;

export interface SnotelPoint {
  date: string;
  value: number;
}

export interface SnotelStation {
  triplet: string;
  name: string;
  detail: string; // "18 mi E · 3,010 ft"
  latest: number | null;
  data: SnotelPoint[];
}

interface ApiStationMetadata {
  stationTriplet: string;
  name: string;
  elevation: number;
  latitude: number;
  longitude: number;
}

interface ApiDataStation {
  stationTriplet: string;
  data: { values: { date: string; value: number | null }[] }[];
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

function distanceMiles(lat: number, lon: number): number {
  const R = 3959;
  const dLat = toRad(lat - REFERENCE_LAT);
  const dLon = toRad(lon - REFERENCE_LON);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(REFERENCE_LAT)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(lat: number, lon: number): string {
  const dLon = toRad(lon - REFERENCE_LON);
  const y = Math.sin(dLon) * Math.cos(toRad(lat));
  const x =
    Math.cos(toRad(REFERENCE_LAT)) * Math.sin(toRad(lat)) -
    Math.sin(toRad(REFERENCE_LAT)) * Math.cos(toRad(lat)) * Math.cos(dLon);
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(deg / 45) % 8];
}

function apiDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useSnotel(): { stations: SnotelStation[] | null; error: boolean } {
  const [stations, setStations] = useState<SnotelStation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const begin = new Date();
      begin.setDate(begin.getDate() - 3);

      const metaParams = new URLSearchParams({
        stationTriplets: STATION_TRIPLETS,
        activeOnly: "true",
      });
      const dataParams = new URLSearchParams({
        stationTriplets: STATION_TRIPLETS,
        elements: "SNWD",
        duration: "HOURLY",
        beginDate: apiDate(begin),
        endDate: "0",
        returnFlags: "false",
        returnOriginalValues: "false",
        returnSuspectData: "false",
      });

      const [metaRes, dataRes] = await Promise.all([
        fetch(`${API}/stations?${metaParams}`),
        fetch(`${API}/data?${dataParams}`),
      ]);
      if (!metaRes.ok || !dataRes.ok) throw new Error("snotel fetch failed");

      const meta: ApiStationMetadata[] = await metaRes.json();
      const metaByTriplet = new Map(meta.map((m) => [m.stationTriplet, m]));
      const apiData: ApiDataStation[] = await dataRes.json();

      const result: SnotelStation[] = apiData
        .filter((s) => s.data?.[0]?.values)
        .map((s) => {
          const m = metaByTriplet.get(s.stationTriplet);
          const data = s.data[0].values
            .filter((v) => v.value !== null)
            .map((v) => ({ date: v.date, value: v.value as number }));
          const detailParts: string[] = [];
          if (m) {
            detailParts.push(
              `${Math.round(distanceMiles(m.latitude, m.longitude))} mi ${bearing(m.latitude, m.longitude)}`
            );
            detailParts.push(`${m.elevation.toLocaleString()} ft`);
          }
          return {
            triplet: s.stationTriplet,
            name: m?.name ?? s.stationTriplet,
            detail: detailParts.join(" · "),
            latest: data.length > 0 ? data[data.length - 1].value : null,
            data,
          };
        });

      if (!cancelled) setStations(result);
    }

    load().catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { stations, error };
}
