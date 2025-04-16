import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchWeatherData, fetchForecastData } from '../services/weatherService';
import { WeatherPanelProps } from '../lib/types';
import ForecastChart from './ForecastChart';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';

const WeatherPanel = ({ city, onWeatherDataUpdate }: WeatherPanelProps) => {
  const queryConfig = { staleTime: 5 * 60 * 1000, enabled: !!city };

  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    error: weatherError,
  } = useQuery({ queryKey: ['weather', city], queryFn: () => fetchWeatherData(city), ...queryConfig });

  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastError,
  } = useQuery({ queryKey: ['forecast', city], queryFn: () => fetchForecastData(city), ...queryConfig });

  useEffect(() => {
    if (weatherData) onWeatherDataUpdate(weatherData);
  }, [weatherData, onWeatherDataUpdate]);

  const isLoading = isWeatherLoading || isForecastLoading;
  const error = weatherError || forecastError;

  if (!city) return <PanelMessage message="Search for a city to view weather data" />;
  if (isLoading) return <PanelMessage message="Loading weather data..." />;
  if (error) return <PanelMessage message={error instanceof Error ? error.message : 'Failed to load weather data'} isError />;

  if (!weatherData || !forecastData) return null;

  const { name, sys, main, weather, wind } = weatherData;

  const metrics = [
    ['Feels Like', `${Math.round(main.feels_like)}°C`],
    ['Humidity', `${main.humidity}%`],
    ['Wind Speed', `${wind.speed} m/s`],
    ['Pressure', `${main.pressure} hPa`],
    ['Sunrise', formatTime(sys.sunrise)],
    ['Sunset', formatTime(sys.sunset)],
  ];

  return (
    <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{name}, {sys.country}</h2>
          <div className="flex justify-center items-center my-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
              alt={weather[0].description}
              className="w-16 h-16"
            />
            <span className="text-4xl font-bold ml-2">{Math.round(main.temp)}°C</span>
          </div>
          <p className="text-xl capitalize">{weather[0].description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="bg-gray-100 p-3 rounded">
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="font-bold">{value}</p>
            </div>
          ))}
        </div>

        <ForecastChart hourlyData={forecastData.hourly.list} />
        <HourlyForecast hourlyData={forecastData.hourly.list} />
        <DailyForecast dailyData={forecastData.daily} />
      </div>
    </div>
  );
};

const PanelMessage = ({ message, isError = false }: { message: string; isError?: boolean }) => (
  <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
    <div className="text-center py-10">
      <p className={isError ? 'text-red-500' : 'text-gray-500'}>{message}</p>
    </div>
  </div>
);

const formatTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default WeatherPanel;
