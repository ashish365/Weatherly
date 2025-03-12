import { useState } from 'react';
import axios from 'axios';

// API configuration
const API_KEY = "b10f61721e15eac21e1134db27c0403e";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
export const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

/**
 * Weather data interface
 */
export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

/**
 * Forecast data interface
 */
export interface ForecastData {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
}

const CITY_NAME_REGEX = /^[a-zA-Z\s-]+$/;

/**
 * Custom hook for fetching and managing weather data
 */
const useWeatherData = () => {
  // State for storing weather and forecast data
  const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(new Map());
  const [forecastData, setForecastData] = useState<Map<string, ForecastData[]>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [retryingCity, setRetryingCity] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  /**
   * Retry a function with exponential backoff
   * @param fn Function to retry
   * @param retries Current retry count
   * @returns Promise with the function result
   */
  const retryWithDelay = async (fn: () => Promise<any>, retries: number = 0, cityName: string = ""): Promise<any> => {
    try {
      setRetryCount(retries);
      if (retries > 0) {
        setRetryingCity(cityName);
      }
      
      const result = await fn();
      
      if (retries > 0) {
        setRetryingCity(null);
        setRetryCount(0);
      }
      
      return result;
    } catch (error) {
      if (retries < MAX_RETRIES) {
        // Calculate exponential backoff delay
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
        setRetryingCity(cityName);
        setRetryCount(retries + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithDelay(fn, retries + 1, cityName);
      }
      setRetryingCity(null);
      setRetryCount(0);
      throw error;
    }
  };

  /**
   * Fetch weather data for a city
   * @param cityName Name of the city to fetch data for
   * @returns Promise resolving to true if successful, false otherwise
   */
  const fetchWeatherData = async (cityName: string): Promise<boolean> => {
    // If empty city name, just clear error and return
    if (!cityName) {
      setError(null);
      return false;
    }

    try {
      // Fetch current weather with retry
      const weatherResponse = await retryWithDelay(() => 
        axios.get(`${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`)
      , 0, cityName);
      
      // Process weather data
      const data = weatherResponse.data;
      setWeatherData(prev => 
        new Map(prev).set(cityName, {
          city: cityName,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          condition: data.weather[0].main,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        })
      );

      // Fetch forecast with retry
      const forecastResponse = await retryWithDelay(() => 
        axios.get(`${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`)
      , 0, cityName);
      
      // Process forecast data - get one forecast per day
      const processedForecast = forecastResponse.data.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: any) => ({
          date: new Date(item.dt * 1000).toLocaleDateString(),
          minTemp: Math.round(item.main.temp_min),
          maxTemp: Math.round(item.main.temp_max),
          condition: item.weather[0].main,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        }));

      setForecastData(prev => new Map(prev).set(cityName, processedForecast));
      setError(null);
      return true;
    } catch (err:any) {
      // Handle different error cases
      if (err.response?.status === 404) {
        setError(`City "${cityName}" not found`);
      } else {
        setError(`Failed to fetch weather data after ${MAX_RETRIES} retries`);
      }
      return false;
    }
  };

  const validateCityName = (cityName: string): boolean => {
    return CITY_NAME_REGEX.test(cityName);
  };

  const prefetchWeatherData = async (cityName: string): Promise<boolean> => {
    try {
      await Promise.all([
        fetchWeatherData(cityName),
        fetchWeatherData(cityName)
      ]);
      return true;
    } catch (error) {
      return false;
    }
  };

  const isLoading = !weatherData.size || !forecastData.size;

  return {
    weatherData,
    forecastData,
    error,
    isLoading,
    retryingCity,
    retryCount,
    prefetchWeatherData,
    validateCityName,
    fetchWeatherData
  };
};

export default useWeatherData; 