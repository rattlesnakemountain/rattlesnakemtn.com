import { useForecast } from "@/lib/nws";
import { relativeAge } from "@/lib/time";
import { Section } from "./section";

export function ForecastSection() {
  const { forecast, error } = useForecast();
  const periods = forecast?.periods.slice(0, 8) ?? [];

  return (
    <Section
      label="Forecast · NWS Seattle"
      age={forecast ? `issued ${relativeAge(forecast.updateTime)}` : undefined}
    >
      {error ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">
          The National Weather Service is not answering right now.
        </p>
      ) : forecast === null ? (
        <p className="font-mono py-6 text-xs text-(--fg-2)">Loading the forecast…</p>
      ) : (
        <ol className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {periods.map((period) => (
            <li key={period.number} className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-medium">{period.name}</h3>
                <p className="font-mono text-lg tracking-tight">
                  {period.temperature}
                  <span className="ml-0.5 text-[13px] text-(--muted)">
                    °{period.temperatureUnit}
                  </span>
                </p>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-(--fg-2)">
                {period.detailedForecast}
              </p>
              <p className="font-mono mt-1.5 text-[11px] text-(--muted)">
                wind {period.windSpeed} {period.windDirection}
                {period.probabilityOfPrecipitation.value
                  ? ` · precip ${period.probabilityOfPrecipitation.value}%`
                  : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
