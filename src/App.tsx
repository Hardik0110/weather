import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import WeatherPanel from './components/WeatherPanel';
import { WeatherData } from './lib/types';

const queryClient = new QueryClient();

function App() {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const handleCitySearch = (searchCity: string) => {
    setCity(searchCity);
  };

  const handleWeatherDataUpdate = (data: WeatherData) => {
    setWeatherData(data);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen">
        <Header onCitySearch={handleCitySearch} />
        <div className="flex flex-1 overflow-hidden">
          <Map weatherData={weatherData} />
          <WeatherPanel city={city} onWeatherDataUpdate={handleWeatherDataUpdate} />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;