import React, { useState, useEffect } from "react";
import styled from "styled-components";
import useLocalStorage from "../hooks/useLocalStorage";
import useWeatherData, {
  ForecastData,
  MAX_RETRIES,
} from "../hooks/useWeatherData";
import { Map, Marker } from "pigeon-maps";
import useCityCoords from "../hooks/useCityCoords";
import { ErrorFallback } from "./ErrorFallback";
import { Skeleton } from "@mui/material";

// Types
interface City {
  id: string;
  name: string;
}

const CITY_NAME_REGEX = /^[a-zA-Z\s-]+$/;

// Styled Components
const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeaderSection = styled.div`
  position: sticky;
  top: 0;
  background-color: #f0f2f5;
  width: 100%;
  padding: 20px 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CityInput = styled.div`
  margin: 20px 0;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  width: 100%;

  input {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    min-width: 200px;
    background-color: white;
    color: #333;
    outline: none;

    &:focus {
      border-color: #4caf50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
    }
  }

  button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background-color: #4caf50;
    color: white;
    cursor: pointer;

    &:hover {
      background-color: #45a049;
    }
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  margin-top: 20px;
  padding-bottom: 20px;
  overflow-y: auto;
`;

const WeatherCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;

  h2 {
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  button {
    float: right;
    background: #333;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;

    &:hover {
      background: #555;
    }
  }
`;

const ForecastContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 15px;
  width: 100%;
`;

const ForecastCard = styled.div`
  background: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
  text-align: center;

  p {
    margin: 5px 0;
    font-size: 0.9rem;
  }

  img {
    width: 50px;
    height: 50px;
  }
`;

const WeatherInfo = styled.div`
  margin-top: 15px;

  p {
    margin: 8px 0;
  }

  img {
    width: 60px;
    height: 60px;
  }
`;

const DraggableCard = styled(WeatherCard)`
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &.dragging {
    opacity: 0.5;
    background: #f8f8f8;
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: grabbing;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MapSection = styled.div`
  width: 100%;
  height: 300px;
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WeatherCardSkeleton = () => (
  <WeatherCard>
    <Skeleton variant="text" width={150} height={32} />
    <WeatherInfo>
      <Skeleton variant="circular" width={60} height={60} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="100%" height={24} />
      <Skeleton variant="text" width="100%" height={24} />
    </WeatherInfo>
    <ForecastContainer>
      {[...Array(5)].map((_, i) => (
        <ForecastCard key={i}>
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="circular" width={50} height={50} />
          <Skeleton variant="text" width="100%" height={24} />
        </ForecastCard>
      ))}
    </ForecastContainer>
  </WeatherCard>
);

const WeatherDashboard: React.FC = () => {
  const [cities, setCities] = useLocalStorage<City[]>("weatherCities", []);
  const [newCity, setNewCity] = useState("");
  const [draggedCity, setDraggedCity] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const {
    weatherData,
    forecastData,
    error: weatherError,
    fetchWeatherData,
    retryingCity,
    retryCount,
  } = useWeatherData();
  const { selectedCity, error: coordsError, fetchCityCoords } = useCityCoords();
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  //effect to handle minimum loading time
  useEffect(() => {
    cities.forEach((city) => {
      if (!loadingStates[city.id]) {
        setLoadingStates((prev) => ({ ...prev, [city.id]: true }));

        // Start loading data
        fetchWeatherData(city.name);

        // Set minimum loading time
        setTimeout(() => {
          setLoadingStates((prev) => ({ ...prev, [city.id]: false }));
        }, 1000);
      }
    });
  }, [cities]);

  useEffect(() => {
    if (weatherError || coordsError || duplicateError) {
      const timer = setTimeout(() => {
        if (weatherError) fetchWeatherData(""); // Clear weather error
        if (coordsError) fetchCityCoords(""); // Clear coords error
        if (duplicateError) setDuplicateError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [weatherError, coordsError, duplicateError]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, cityId: string) => {
    setDraggedCity(cityId);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedCity(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetCityId: string) => {
    e.preventDefault();
    if (!draggedCity || draggedCity === targetCityId) return;

    const draggedIndex = cities.findIndex((city) => city.id === draggedCity);
    const targetIndex = cities.findIndex((city) => city.id === targetCityId);

    const newCities = [...cities];
    const [draggedCityObj] = newCities.splice(draggedIndex, 1);
    newCities.splice(targetIndex, 0, draggedCityObj);

    setCities(newCities);
  };

  const validateCityName = (cityName: string): boolean => {
    return CITY_NAME_REGEX.test(cityName);
  };

  const handleAddCity = async () => {
    const cityName = newCity.trim();
    if (!cityName) return;
    if (!validateCityName(cityName)) return;

    if (
      cities.some((city) => city.name.toLowerCase() === cityName.toLowerCase())
    ) {
      setDuplicateError(`${cityName} is already in your dashboard`);
      setNewCity("");
      return;
    }

    setDuplicateError(null); // Clear any previous duplicate error
    setNewCity("");
    const isValid = await fetchWeatherData(cityName);
    if (isValid) {
      const cityId = `${cityName}-${Date.now()}`;
      setCities([...cities, { id: cityId, name: cityName }]);

      // Show the map for the newly added city
      await fetchCityCoords(cityName);
    }
  };

  // input validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, and hyphens while typing
    if (value === "" || CITY_NAME_REGEX.test(value)) {
      setNewCity(value);
    }
  };

  const handleRemoveCity = (cityId: string, e: React.MouseEvent) => {
    // Stop the event from propagating to the parent card
    e.stopPropagation();
    setCities(cities.filter((city) => city.id !== cityId));
  };

  const handleCityClick = async (cityName: string) => {
    await fetchCityCoords(cityName);
  };

  return (
    <DashboardContainer>
      <HeaderSection>
        <h1>Weather Dashboard</h1>
        <CityInput>
          <input
            type="text"
            value={newCity}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleAddCity()}
            placeholder="Enter city name"
            disabled={cities.length >= 10}
          />
          <button onClick={handleAddCity} disabled={cities.length >= 10}>
            Add City
          </button>
          {cities.length >= 10 && (
            <span style={{ color: "red", marginLeft: "10px" }}>
              Maximum limit of 10 cities reached
            </span>
          )}
        </CityInput>
        {(weatherError || coordsError || duplicateError) && (
          <ErrorFallback
            error={weatherError || coordsError || duplicateError}
          />
        )}
        {retryingCity && (
          <div
            style={{
              color: "#ff9800",
              backgroundColor: "#fff3e0",
              padding: "10px",
              borderRadius: "4px",
              margin: "10px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: "spin 1s linear infinite",
              }}
            >
              ⟳
            </span>
            <span>
              Retrying API request for {retryingCity} (Attempt {retryCount}/
              {MAX_RETRIES})
            </span>
          </div>
        )}
      </HeaderSection>

      {selectedCity && (
        <MapSection>
          <Map
            height={300}
            center={[selectedCity.lat, selectedCity.lon]}
            zoom={11}
          >
            <Marker width={50} anchor={[selectedCity.lat, selectedCity.lon]} />
          </Map>
        </MapSection>
      )}

      <WeatherGrid>
        {cities.map((city) => {
          const weather = weatherData.get(city.name);
          const forecast = forecastData.get(city.name);
          const isLoading = loadingStates[city.id] || !weather || !forecast;

          if (isLoading) {
            return <WeatherCardSkeleton key={city.id} />;
          }

          return (
            <DraggableCard
              key={city.id}
              draggable
              onDragStart={(e) => handleDragStart(e, city.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, city.id)}
              onClick={() => handleCityClick(city.name)}
            >
              <button onClick={(e) => handleRemoveCity(city.id, e)}>×</button>
              <h2>{city.name}</h2>

              {weather && (
                <WeatherInfo>
                  <img src={weather.icon} alt={weather.condition} />
                  <p>Temperature: {weather.temperature}°C</p>
                  <p>Humidity: {weather.humidity}%</p>
                  <p>Wind Speed: {weather.windSpeed} m/s</p>
                  <p>Condition: {weather.condition}</p>
                </WeatherInfo>
              )}

              {forecast && (
                <ForecastContainer>
                  {forecast.map((day: ForecastData, index: number) => (
                    <ForecastCard key={index}>
                      <p>{day.date}</p>
                      <img src={day.icon} alt={day.condition} />
                      <p>
                        {day.minTemp}°C - {day.maxTemp}°C
                      </p>
                    </ForecastCard>
                  ))}
                </ForecastContainer>
              )}
            </DraggableCard>
          );
        })}
      </WeatherGrid>
    </DashboardContainer>
  );
};

export default WeatherDashboard;
