export interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

export interface HourlyForecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
  };
}

export interface DailyForecast {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  feels_like: {
    day: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  humidity: number;
}

export interface ForecastData {
  hourly: HourlyForecast;
  daily: DailyForecast[];
}

export interface HeaderProps {
  onCitySearch: (city: string) => void;
}

export interface WeatherPanelProps {
  city: string;
  onWeatherDataUpdate: (data: WeatherData) => void;
}

export interface MapProps {
  weatherData: WeatherData | null;
}

export interface ForecastChartProps {
  hourlyData: HourlyForecast['list'];
}