import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';

type WeatherData = {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=51.9625&longitude=7.6251&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe/Berlin`
      );

      if (!response.ok) throw new Error('Failed to fetch weather data');

      const data = await response.json();
      const current = data.current;

      const weatherDescriptions: { [key: number]: string } = {
        0: 'Clear',
        1: 'Partly Cloudy',
        2: 'Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        51: 'Light Drizzle',
        61: 'Rain',
        71: 'Snow',
        80: 'Rain Showers',
        95: 'Thunderstorm',
      };

      setWeather({
        temperature: Math.round(current.temperature_2m),
        description: weatherDescriptions[current.weather_code] || 'Unknown',
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        icon: current.weather_code < 3 ? 'clear' : current.weather_code < 45 ? 'clouds' : 'rain',
      });
    } catch (err) {
      setError('Unable to load weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return CloudRain;
      case 'clear':
        return Sun;
      case 'clouds':
        return Cloud;
      default:
        return Cloud;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md p-6 text-white">
        <p>Loading weather...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl shadow-md p-6 text-white">
        <p>{error || 'Weather data unavailable'}</p>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">Muenster Weather</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Thermometer className="w-8 h-8 mr-2" />
              <span className="text-4xl font-bold">{weather.temperature}°C</span>
            </div>
            <div>
              <p className="text-lg capitalize">{weather.description}</p>
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <WeatherIcon className="w-16 h-16 ml-auto" />
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-end space-x-2">
              <Droplets className="w-4 h-4" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Wind className="w-4 h-4" />
              <span>{weather.windSpeed} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
