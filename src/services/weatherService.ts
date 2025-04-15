import { WeatherData, ForecastData } from '../lib/types';

interface CitySearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

const API_KEY = '3bfa5c2b299a3c0e5699077fe57c970c';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const  FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

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
    const geoResponse = await fetch(
      `${FORECAST_BASE_URL}/daily?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const locations = await geoResponse.json();
    if (!locations.length) {
      throw new Error('City not found');
    }

    const { lat, lon } = locations[0];
    
    // Fetch hourly forecast data (5-day / 3-hour forecast)
    const hourlyResponse = await fetch(
      `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    if (!hourlyResponse.ok) {
      throw new Error('Failed to fetch hourly forecast data');
    }
    
    const hourlyData = await hourlyResponse.json();
    
    // Fetch monthly forecast data (using One Call API for 7-day forecast as a substitute)
    const monthlyResponse = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${API_KEY}`
    );
    
    if (!monthlyResponse.ok) {
      throw new Error('Failed to fetch daily forecast data');
    }
    
    const monthlyData = await monthlyResponse.json();
    
    return {
      hourly: hourlyData,
      daily: monthlyData.daily
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