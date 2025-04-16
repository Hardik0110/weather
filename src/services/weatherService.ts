import { WeatherData, ForecastData } from '../lib/types';
import { WEATHER_CODES } from './weatherCodes';

const API_KEY = '3bfa5c2b299a3c0e5699077fe57c970c';

const API_CONFIG = {
  geo: 'https://api.openweathermap.org/geo/1.0',
  weather: 'https://api.openweathermap.org/data/2.5',
  forecast: 'https://api.open-meteo.com/v1/forecast',
};


const utils = {
  formatParams: (params: Record<string, string>): string =>
    new URLSearchParams(params).toString(),

  isDay: (timestamp: number): boolean => {
    const hour = new Date(timestamp * 1000).getHours();
    return hour >= 6 && hour < 18;
  },

  getDescription: (code: number): string =>
    (WEATHER_CODES.description as Record<number, string>)[code] || 'unknown',

  getIcon: (code: number, isDay: boolean): string =>
    `${(WEATHER_CODES.icon as Record<number, string>)[code] || '50'}${isDay ? 'd' : 'n'}`,
};

const api = {
  fetchGeo: async (city: string): Promise<any> => {
    const res = await fetch(
      `${API_CONFIG.geo}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );
    if (!res.ok) throw new Error('Failed to fetch location');
    const data = await res.json();
    if (!data.length) throw new Error('City not found');
    return data[0];
  },

  fetchWeather: async (lat: number, lon: number): Promise<any> => {
    const res = await fetch(
      `${API_CONFIG.weather}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  },

  fetchForecast: async (lat: number, lon: number): Promise<any> => {
    const params = {
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'temperature_2m,apparent_temperature,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max',
      timezone: 'auto',
      forecast_days: '7',
    };
    const res = await fetch(`${API_CONFIG.forecast}?${utils.formatParams(params)}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },
};

const transform = {
  hourly: (data: any) => ({
    list: data.hourly.time.slice(0, 24).map((t: string, i: number) => {
      const dt = new Date(t).getTime() / 1000;
      const day = utils.isDay(dt);
      return {
        dt,
        main: {
          temp: data.hourly.temperature_2m[i],
          feels_like: data.hourly.apparent_temperature[i],
        },
        weather: [
          {
            id: data.hourly.weather_code[i],
            main: utils.getDescription(data.hourly.weather_code[i]),
            description: utils.getDescription(data.hourly.weather_code[i]),
            icon: utils.getIcon(data.hourly.weather_code[i], day),
          },
        ],
      };
    }),
  }),

  daily: (data: any) =>
    data.daily.time.map((t: string, i: number) => {
      const dt = new Date(t).getTime() / 1000;
      const max = data.daily.temperature_2m_max[i];
      const min = data.daily.temperature_2m_min[i];
      const apparent = data.daily.apparent_temperature_max[i];
      const code = data.daily.weather_code[i];
      return {
        dt,
        temp: { day: (max + min) / 2, min, max },
        feels_like: {
          day: apparent,
          night: apparent - 2,
          eve: apparent - 1,
          morn: apparent - 1,
        },
        weather: [
          {
            id: code,
            main: utils.getDescription(code),
            description: utils.getDescription(code),
            icon: utils.getIcon(code, true),
          },
        ],
      };
    }),
};

export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  const geo = await api.fetchGeo(city);
  return api.fetchWeather(geo.lat, geo.lon);
};

export const fetchForecastData = async (city: string): Promise<ForecastData> => {
  const geo = await api.fetchGeo(city);
  const data = await api.fetchForecast(geo.lat, geo.lon);
  return {
    hourly: {
      ...transform.hourly(data),
      city: {
        name: geo.name,
        country: geo.country,
      },
    },
    daily: transform.daily(data),
    city: {
      name: geo.name,
      country: geo.country,
    },
    timezone: data.timezone,
  };
};

export const fetchCitySuggestions = async (query: string): Promise<string[]> => {
  try {
    const res = await fetch(
      `${API_CONFIG.geo}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.map((item: any) =>
      [item.name, item.state, item.country].filter(Boolean).join(', ')
    );
  } catch {
    return [];
  }
};
