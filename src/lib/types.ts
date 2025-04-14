export interface WeatherData {
    name: string;
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
    sys: {
      country: string;
      sunrise: number;
      sunset: number;
    };
  }
  
  export interface HeaderProps {
    onCitySearch: (city: string) => void;
  }
  
  export interface MapProps {
    weatherData: WeatherData | null;
  }
  
  export interface WeatherPanelProps {
    city: string;
    onWeatherDataUpdate: (data: WeatherData) => void;
  }