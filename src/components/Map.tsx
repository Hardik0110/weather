import { useEffect, useRef } from 'react';
import { MapProps } from '../lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ weatherData }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([51.505, -0.09], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    if (weatherData && mapInstanceRef.current) {
      const { lat, lon } = weatherData.coord;
      
      if (markerRef.current) {
        markerRef.current.remove();
      }
      
      mapInstanceRef.current.setView([lat, lon], 13);
      
      markerRef.current = L.marker([lat, lon])
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <b>${weatherData.name}, ${weatherData.sys.country}</b><br>
          <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="${weatherData.weather[0].description}" style="margin: 0 auto; display: block;"><br>
          <b>${Math.round(weatherData.main.temp)}°C</b>, ${weatherData.weather[0].description}
        `)
        .openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [weatherData]);

  return (
    <div className="flex-1 relative">
      <div ref={mapRef} className="absolute inset-0"></div>
    </div>
  );
};

export default Map;