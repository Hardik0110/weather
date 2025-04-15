import { WeatherData, ForecastData } from '../lib/types';

interface CitySearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

// OpenWeatherMap API settings
const API_KEY = '3bfa5c2b299a3c0e5699077fe57c970c';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Open-Meteo API URL
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  try {
    const geoResponse = await fetch(
      `${GEO_BASE_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const locations = await geoResponse.json();
    if (!locations.length) {
      throw new Error('City not found');
    }

    const { lat, lon } = locations[0];
    
    const weatherResponse = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    return await weatherResponse.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Weather data fetch failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred when fetching weather data');
  }
};

export const fetchForecastData = async (city: string): Promise<ForecastData> => {
  try {
    // Use OpenWeatherMap for geocoding
    const geoResponse = await fetch(
      `${GEO_BASE_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const locations = await geoResponse.json();
    if (!locations.length) {
      throw new Error('City not found');
    }

    const { lat, lon } = locations[0];
    
    // Use Open-Meteo for forecast data
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'temperature_2m,apparent_temperature,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max',
      timezone: 'auto',
      forecast_days: '7'
    });
    
    const meteoResponse = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
    
    if (!meteoResponse.ok) {
      throw new Error('Failed to fetch forecast data from Open-Meteo');
    }
    
    const meteoData = await meteoResponse.json();
    
    // Transform Open-Meteo data to match the format expected by the components
    const hourlyData = transformHourlyData(meteoData);
    const dailyData = transformDailyData(meteoData);
    
    return {
      hourly: hourlyData,
      daily: dailyData
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Forecast data fetch failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred when fetching forecast data');
  }
};

export const fetchCitySuggestions = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `${GEO_BASE_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    
    const data: CitySearchResult[] = await response.json();
    return data.map(item => {
      const parts = [item.name, item.country];
      if (item.state) parts.splice(1, 0, item.state);
      return parts.join(', ');
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

// Helper function to transform Open-Meteo hourly data to match OpenWeatherMap format
function transformHourlyData(meteoData: any) {
  const hourlyList = [];
  const times = meteoData.hourly.time;
  const temps = meteoData.hourly.temperature_2m;
  const feelsLike = meteoData.hourly.apparent_temperature;
  const weatherCodes = meteoData.hourly.weather_code;
  
  for (let i = 0; i < 24; i++) {  // Limit to first 24 hours for hourly forecast
    const timestamp = new Date(times[i]).getTime() / 1000;
    
    hourlyList.push({
      dt: timestamp,
      main: {
        temp: temps[i],
        feels_like: feelsLike[i],
      },
      weather: [
        {
          id: weatherCodes[i],
          main: getWeatherDescription(weatherCodes[i]),
          description: getWeatherDescription(weatherCodes[i]),
          icon: getWeatherIcon(weatherCodes[i], isDay(timestamp)),
        }
      ]
    });
  }
  
  return { list: hourlyList };
}

// Helper function to transform Open-Meteo daily data to match OpenWeatherMap format
function transformDailyData(meteoData: any) {
  const dailyList = [];
  const times = meteoData.daily.time;
  const maxTemps = meteoData.daily.temperature_2m_max;
  const minTemps = meteoData.daily.temperature_2m_min;
  const feelsLike = meteoData.daily.apparent_temperature_max;
  const weatherCodes = meteoData.daily.weather_code;
  
  for (let i = 0; i < times.length; i++) {
    const timestamp = new Date(times[i]).getTime() / 1000;
    
    dailyList.push({
      dt: timestamp,
      temp: {
        day: (maxTemps[i] + minTemps[i]) / 2,
        min: minTemps[i],
        max: maxTemps[i],
      },
      feels_like: {
        day: feelsLike[i],
        night: feelsLike[i] - 2, // Approximation
        eve: feelsLike[i] - 1,   // Approximation
        morn: feelsLike[i] - 1,  // Approximation
      },
      weather: [
        {
          id: weatherCodes[i],
          main: getWeatherDescription(weatherCodes[i]),
          description: getWeatherDescription(weatherCodes[i]),
          icon: getWeatherIcon(weatherCodes[i], true),
        }
      ]
    });
  }
  
  return dailyList;
}

// Helper function to check if it's daytime
function isDay(timestamp: number): boolean {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  return hours >= 6 && hours < 18;
}

// Helper function to map WMO weather codes to OpenWeatherMap-like descriptions
function getWeatherDescription(code: number): string {
  // Map WMO codes to descriptions
  // See https://open-meteo.com/en/docs for full code list
  switch (true) {
    case code === 0:
      return 'clear sky';
    case code === 1:
      return 'mainly clear';
    case code === 2:
      return 'partly cloudy';
    case code === 3:
      return 'overcast';
    case code >= 45 && code <= 48:
      return 'fog';
    case code >= 51 && code <= 55:
      return 'drizzle';
    case code >= 56 && code <= 57:
      return 'freezing drizzle';
    case code >= 61 && code <= 65:
      return 'rain';
    case code >= 66 && code <= 67:
      return 'freezing rain';
    case code >= 71 && code <= 77:
      return 'snow';
    case code >= 80 && code <= 82:
      return 'shower rain';
    case code >= 85 && code <= 86:
      return 'snow shower';
    case code >= 95 && code <= 99:
      return 'thunderstorm';
    default:
      return 'unknown';
  }
}

// Helper function to map WMO weather codes to OpenWeatherMap-like icon codes
function getWeatherIcon(code: number, isDay: boolean): string {
  const dayNight = isDay ? 'd' : 'n';
  
  // Map WMO codes to OpenWeatherMap icon codes
  switch (true) {
    case code === 0:
      return `01${dayNight}`;  // clear sky
    case code === 1:
      return `02${dayNight}`;  // mainly clear
    case code === 2:
      return `03${dayNight}`;  // partly cloudy
    case code === 3:
      return `04${dayNight}`;  // overcast
    case code >= 45 && code <= 48:
      return `50${dayNight}`;  // fog
    case code >= 51 && code <= 55:
      return `09${dayNight}`;  // drizzle
    case code >= 56 && code <= 57:
      return `13${dayNight}`;  // freezing drizzle
    case code >= 61 && code <= 65:
      return `10${dayNight}`;  // rain
    case code >= 66 && code <= 67:
      return `13${dayNight}`;  // freezing rain
    case code >= 71 && code <= 77:
      return `13${dayNight}`;  // snow
    case code >= 80 && code <= 82:
      return `09${dayNight}`;  // shower rain
    case code >= 85 && code <= 86:
      return `13${dayNight}`;  // snow shower
    case code >= 95 && code <= 99:
      return `11${dayNight}`;  // thunderstorm
    default:
      return `50${dayNight}`;  // default to mist
  }
}