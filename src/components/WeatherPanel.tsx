import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchWeatherData } from '../services/weatherService';
import { WeatherPanelProps } from '../lib/types';

const WeatherPanel = ({ city, onWeatherDataUpdate }: WeatherPanelProps) => {
  const {
    data: weatherData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeatherData(city),
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (weatherData) {
      onWeatherDataUpdate(weatherData);
    }
  }, [weatherData, onWeatherDataUpdate]);

  if (!city) {
    return (
      <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
        <div className="text-center py-10">
          <p className="text-gray-500">Search for a city to view weather data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
        <div className="text-center py-10">
          <p className="text-red-500">
            {error instanceof Error ? error.message : 'Failed to load weather data'}
          </p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const {
    name,
    sys,
    main,
    weather,
    wind,
  } = weatherData;

  const formattedTemp = (temp: number) => `${Math.round(temp)}°C`;
  const formattedTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            {name}, {sys.country}
          </h2>
          <div className="flex justify-center items-center my-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
              alt={weather[0].description}
              className="w-16 h-16"
            />
            <span className="text-4xl font-bold ml-2">{formattedTemp(main.temp)}</span>
          </div>
          <p className="text-xl capitalize">{weather[0].description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-500 text-sm">Feels Like</p>
            <p className="font-bold">{formattedTemp(main.feels_like)}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-500 text-sm">Humidity</p>
            <p className="font-bold">{main.humidity}%</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-500 text-sm">Wind Speed</p>
            <p className="font-bold">{wind.speed} m/s</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-500 text-sm">Pressure</p>
            <p className="font-bold">{main.pressure} hPa</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-500 text-sm">Sunrise</p>
            <p className="font-bold">{formattedTime(sys.sunrise)}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-500 text-sm">Sunset</p>
            <p className="font-bold">{formattedTime(sys.sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPanel;