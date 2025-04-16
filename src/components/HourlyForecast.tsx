import { HourlyForecast as HourlyForecastType } from '../lib/types';

interface HourlyForecastProps {
  hourlyData: HourlyForecastType['list'];
}

const HourlyForecast = ({ hourlyData }: HourlyForecastProps) => {
  const formattedData = hourlyData.slice(0, 8).map(item => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      icon: item.weather[0].icon,
      description: item.weather[0].description,
    };
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Hourly Forecast</h3>
      <div className="overflow-x-auto">
        <div className="flex space-x-4 py-2">
          {formattedData.map((item, index) => (
            <div key={index} className="flex flex-col items-center min-w-20 bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-500">{item.time}</p>
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                alt={item.description}
                className="w-10 h-10"
              />
              <p className="font-bold">{item.temp}°C</p>
              <p className="text-xs text-gray-500">Feels: {item.feels_like}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast