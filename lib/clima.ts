import type { ClimaResponse } from '@/types';

export async function fetchClima(lat: number, lng: number): Promise<ClimaResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=America%2FSanta_Isabel&forecast_days=7&current_weather=true`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error('Error al obtener clima');

  const data = await res.json();
  const hoy = data.daily;

  const riesgoHelada = hoy.temperature_2m_min[0] < 4;
  const riesgoSequia =
    hoy.precipitation_sum[0] === 0 && hoy.precipitation_sum[1] === 0;
  const riesgoViento = hoy.windspeed_10m_max[0] > 40;

  return {
    forecast: data.daily,
    current: data.current_weather,
    alertas: {
      helada: riesgoHelada,
      sequia: riesgoSequia,
      viento: riesgoViento,
    },
  };
}
