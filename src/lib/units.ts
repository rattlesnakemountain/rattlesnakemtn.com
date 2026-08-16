// The station reports metric; the site shows imperial, matching its audience.

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function cToF1(c: number): number {
  return Math.round(((c * 9) / 5 + 32) * 10) / 10;
}

export function hPaToInHg(hPa: number): number {
  return Math.round(hPa * 0.02953 * 100) / 100;
}

// The station reports station pressure at the tower. Visitors expect the
// sea-level value every forecast uses (and the camera's own annotation shows),
// so correct with the hypsometric formula using the current temperature.
const SITE_ELEVATION_M = 1000;

export function seaLevelHPa(stationHPa: number, tempC: number): number {
  const h = SITE_ELEVATION_M;
  const kelvin = tempC + 273.15;
  return stationHPa * Math.pow(1 - (0.0065 * h) / (kelvin + 0.0065 * h), -5.257);
}

export function msToMph(ms: number): number {
  return Math.round(ms * 2.237 * 10) / 10;
}

export function mmToInches(mm: number): number {
  return Math.round(mm * 0.03937 * 100) / 100;
}

export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371);
}

const CARDINALS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export function degreesToCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return CARDINALS[Math.round(normalized / 22.5) % 16];
}
