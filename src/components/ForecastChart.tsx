import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ForecastChartProps } from '../lib/types';

const ForecastChart = ({ hourlyData }: ForecastChartProps) => {
  const chartData = hourlyData.slice(0, 8).map(item => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
    };
  });

  const lineConfig = [
    { dataKey: 'temp', stroke: '#8884d8', name: 'Temperature' },
    { dataKey: 'feels_like', stroke: '#82ca9d', name: 'Feels Like' }
  ];

  return (
    <div className="w-full h-64 mt-6">
      <h3 className="text-lg font-semibold mb-2">Hourly Forecast</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis unit="°C" />
          <Tooltip formatter={(value) => [`${value}°C`]} />
          
          {lineConfig.map((config, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.stroke}
              name={config.name}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;