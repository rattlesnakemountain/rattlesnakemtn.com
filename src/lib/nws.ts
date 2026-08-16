// NWS forecast for the mountain's gridpoint, fetched straight from
// api.weather.gov (it allows any origin).

import { useEffect, useState } from "react";

const FORECAST_URL = "https://api.weather.gov/gridpoints/SEW/139,58/forecast";

export interface ForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  probabilityOfPrecipitation: { value: number | null };
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface Forecast {
  updateTime: string;
  periods: ForecastPeriod[];
}

export function useForecast(): { forecast: Forecast | null; error: boolean } {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(FORECAST_URL, { headers: { Accept: "application/geo+json" } })
      .then((res) => {
        if (!res.ok) throw new Error(`forecast ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setForecast({
          updateTime: data.properties.updateTime,
          periods: data.properties.periods,
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { forecast, error };
}
