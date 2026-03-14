import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Burlington, MA coordinates
const BURLINGTON_LAT = 42.5047;
const BURLINGTON_LON = -71.2006;
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Weather cache collection reference
const weatherCacheRef = collection(db, 'weatherCache');

export const weatherService = {
  // Get weather data with caching
  async getWeatherData(gameDate, gameTime) {
    if (!WEATHER_API_KEY) {
      console.warn('No weather API key found, using default weather');
      return { temp: 75, condition: "TBD", icon: "Sun" };
    }

    try {
      const cacheKey = gameDate;
      const cacheDoc = doc(weatherCacheRef, cacheKey);

      const cachedData = await getDoc(cacheDoc);
      const now = new Date();

      if (cachedData.exists()) {
        const data = cachedData.data();
        const cacheTime = data.cachedAt?.toDate();

        if (cacheTime && (now - cacheTime) < 2 * 60 * 60 * 1000) {
          return data.weather;
        }
      }

      const weatherData = await this.fetchWeatherFromAPI(gameDate, gameTime);
      
      // Cache the weather data
      await setDoc(cacheDoc, {
        weather: weatherData,
        cachedAt: serverTimestamp(),
        gameDate: gameDate
      });
      
      return weatherData;
    } catch (error) {
      console.error('Error getting weather data:', error);
      // Return default weather if API fails
      return { temp: 75, condition: "TBD", icon: "Sun" };
    }
  },

  // Fetch weather from OpenWeatherMap API
  async fetchWeatherFromAPI(gameDate, gameTime) {
    const gameDateTime = new Date(`${gameDate} ${gameTime}`);
    const now = new Date();
    const hoursDiff = (gameDateTime - now) / (1000 * 60 * 60);

    let weatherData;

    if (hoursDiff <= 120) {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${BURLINGTON_LAT}&lon=${BURLINGTON_LON}&appid=${WEATHER_API_KEY}&units=imperial`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather API request failed: ${response.status}`);

      const data = await response.json();
      
      // Find the forecast closest to game time
      const targetTime = gameDateTime.getTime();
      let closestForecast = data.list[0];
      let smallestDiff = Math.abs(new Date(closestForecast.dt * 1000) - targetTime);
      
      for (const forecast of data.list) {
        const forecastTime = new Date(forecast.dt * 1000);
        const diff = Math.abs(forecastTime - targetTime);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestForecast = forecast;
        }
      }

      weatherData = {
        temp: Math.round(closestForecast.main.temp),
        condition: this.getConditionFromCode(closestForecast.weather[0].main),
        icon: this.getIconFromCode(closestForecast.weather[0].main)
      };
    } else {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${BURLINGTON_LAT}&lon=${BURLINGTON_LON}&appid=${WEATHER_API_KEY}&units=imperial`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Weather API request failed: ${response.status}`);

      const data = await response.json();
      
      weatherData = {
        temp: Math.round(data.main.temp),
        condition: this.getConditionFromCode(data.weather[0].main),
        icon: this.getIconFromCode(data.weather[0].main)
      };
    }

    return weatherData;
  },

  // Convert OpenWeatherMap condition to friendly text
  getConditionFromCode(weatherMain) {
    const conditions = {
      'Clear': 'perfect',
      'Clouds': 'partly cloudy',
      'Rain': 'rainy',
      'Drizzle': 'light rain',
      'Snow': 'snowy',
      'Thunderstorm': 'stormy',
      'Mist': 'misty',
      'Fog': 'foggy'
    };
    return conditions[weatherMain] || 'variable';
  },

  // Convert OpenWeatherMap condition to icon component name
  getIconFromCode(weatherMain) {
    const icons = {
      'Clear': 'Sun',
      'Clouds': 'Cloud',
      'Rain': 'CloudRain',
      'Drizzle': 'CloudDrizzle',
      'Snow': 'CloudSnow',
      'Thunderstorm': 'CloudLightning',
      'Mist': 'Cloud',
      'Fog': 'Cloud'
    };
    return icons[weatherMain] || 'Sun';
  },

  // Update weather for existing games (called when displaying games)
  async refreshWeatherForGame(game) {
    try {
      // Get fresh weather data for the game date
      const freshWeather = await this.getWeatherData(game.date, game.time);
      
      // Return game with updated weather
      return {
        ...game,
        weather: freshWeather
      };
    } catch (error) {
      console.error('Error refreshing weather for game:', error);
      // Return original game if weather refresh fails
      return game;
    }
  }
};