import React, { useState, useEffect } from "react";
import { fetchWeather } from "./api/fetchWeather";
import "./styles/App.css";

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState("C");

  useEffect(() => {
    const storedUnit = localStorage.getItem("unit");
    if (storedUnit) {
      setUnit(storedUnit);
    }

    const storedSearches = JSON.parse(localStorage.getItem("recentSearches"));
    if (storedSearches) {
      setRecentSearches(storedSearches);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const fetchData = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        const data = await fetchWeather(cityName);
        setWeatherData(data);
        setRecentSearches((prevSearches) => {
          const updatedSearches = [cityName, ...prevSearches];
          return [...new Set(updatedSearches)].slice(0, 5);
        });
        setCityName("");
        setError(null);
      } catch (error) {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  const handleRecentSearch = async (city) => {
    setLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleUnitToggle = () => {
    setUnit((prevUnit) => (prevUnit === "C" ? "F" : "C"));
  };

  return (
    <div className="app-container">
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Enter city name..."
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onKeyDown={fetchData}
        />
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <button className="unit-toggle" onClick={handleUnitToggle}>
          Toggle to {unit === "C" ? "Fahrenheit" : "Celsius"}
        </button>
      </div>
      {recentSearches.length > 0 && (
        <div className="recent-searches-container">
          <h3>Recent Searches:</h3>
          <ul className="recent-searches-list">
            {recentSearches.map((city, index) => (
              <li key={index} onClick={() => handleRecentSearch(city)}>
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}
      {weatherData && (
        <div className="weather-data-container">
          <h2>
            {weatherData.location.name}, {weatherData.location.region},{" "}
            {weatherData.location.country}
          </h2>
          <p>
            Temperature:{" "}
            {unit === "C"
              ? `${weatherData.current.temp_c} °C`
              : `${weatherData.current.temp_f} °F`}
          </p>
          <p>Condition: {weatherData.current.condition.text}</p>
          <img
            src={weatherData.current.condition.icon}
            alt={weatherData.current.condition.text}
          />
          <p>Humidity: {weatherData.current.humidity} %</p>
          <p>Pressure: {weatherData.current.pressure_mb} mb</p>
          <p>Visibility: {weatherData.current.vis_km} km</p>
        </div>
      )}
    </div>
  );
};

export default App;
