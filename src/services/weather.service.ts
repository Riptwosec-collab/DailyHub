import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchWeatherUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const enabled = process.env.ENABLE_REAL_DATA_SOURCES === "true" && process.env.ENABLE_WEATHER_SOURCE === "true";
  const latitude = process.env.WEATHER_LATITUDE || "13.7563";
  const longitude = process.env.WEATHER_LONGITUDE || "100.5018";
  const locationName = process.env.WEATHER_LOCATION_NAME || "Bangkok";

  if (!enabled) {
    return {
      source: "Weather API",
      status: "mock",
      data: {
        location: locationName,
        summary: "Mock weather: cloudy with a chance of afternoon rain.",
        temperature: 31,
        rainRisk: "medium",
      },
    };
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", "temperature_2m,precipitation,rain,weather_code");
  url.searchParams.set("timezone", "Asia/Bangkok");

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Weather API failed: ${response.status}`);
  const json = await response.json();

  return {
    source: "Weather API",
    status: "success",
    data: { location: locationName, forecast: json },
  };
}
