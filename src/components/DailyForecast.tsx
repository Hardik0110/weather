import { DailyForecast as DailyForecastType } from '../lib/types';

interface DailyForecastProps {
  dailyData: DailyForecastType[];
}

const DailyForecast = ({ dailyData }: DailyForecastProps) => {
  const getDayName = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">7-Day Forecast</h3>
      <div className="space-y-2">
        {dailyData.map((day, index) => (
          <div key={index} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-16 font-medium">{getDayName(day.dt)}</span>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt={day.weather[0].description}
                className="w-10 h-10"
              />
              <span className="hidden sm:inline text-sm capitalize ml-2">{day.weather[0].description}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Feels Like</p>
                <p>{Math.round(day.feels_like.day)}°C</p>
              </div>
              <div className="text-right w-20">
                <span className="font-bold">{Math.round(day.temp.max)}°</span>
                <span className="text-gray-500 ml-1">{Math.round(day.temp.min)}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;