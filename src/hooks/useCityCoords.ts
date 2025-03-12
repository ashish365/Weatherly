import { useState } from 'react';
import axios from 'axios';

// API configuration
const API_KEY = "b10f61721e15eac21e1134db27c0403e";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * City coordinates interface
 */
interface CityCoords {
  lat: number;
  lon: number;
}

/**
 * Custom hook for fetching and managing city coordinates
 */
const useCityCoords = () => {
  // State for storing selected city coordinates and errors
  const [selectedCity, setSelectedCity] = useState<CityCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch coordinates for a city
   * @param cityName Name of the city to fetch coordinates for
   * @returns Promise resolving to true if successful, false otherwise
   */
  const fetchCityCoords = async (cityName: string): Promise<boolean> => {
    // If empty city name, just clear error and selected city
    if (!cityName) {
      setError(null);
      return false;
    }
    
    try {
      const response = await axios.get(
        `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const { lat, lon } = response.data.coord;
      setSelectedCity({ lat, lon });
      setError(null);
      return true;
    } catch (error) {
      setError('Error fetching city coordinates');
      return false;
    }
  };

  return { selectedCity, error, fetchCityCoords };
};

export default useCityCoords; 