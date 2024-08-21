import axios from "axios";
import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric"); 

  const fetchWeatherData = async () => {
    if (!city) {
      setError("City name is required.");
      return;
    }

    try {
      const locationResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=8da59502e924c6782053a4bae8f326a8`
      );

      if (locationResponse.data.length === 0) {
        setError("City not found.");
        return;
      }

      const locationData = locationResponse.data[0];
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.lat}&lon=${locationData.lon}&appid=8da59502e924c6782053a4bae8f326a8&units=${unit}`
      );
      setWeather(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${locationData.lat}&lon=${locationData.lon}&appid=8da59502e924c6782053a4bae8f326a8&units=${unit}`
      );

      const forecastData = forecastResponse.data.list
        .filter((entry) => entry.dt_txt.endsWith("12:00:00")) // Take forecast data at 12:00 PM for consistency
        .map((entry) => ({
          date: entry.dt_txt.split(" ")[0],
          temp: entry.main.temp,
          description: entry.weather[0].description,
          icon: entry.weather[0].icon,
        }));

      setForecast(forecastData);
      setError("");
    } catch (err) {
      setError("Failed to fetch data.");
      console.log(err);
    }
  };

 

  const handleClick = () => {
    fetchWeatherData()
  };

  const handleUnitToggle = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  };

  const convertTemperature = (temp) => {
    return unit === "metric"
      ? temp
      : temp * 9/5 + 32; 
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center bg-cover bg-center"
      style={{ backgroundImage: `url('/backgroud.jpg')` }}
    >
      <h1 className="text-5xl mt-7 text-white font-sans">WEATHER APP</h1>
      <div className="mt-8 w-full max-w-md px-4 py-8 bg-white bg-opacity-80 rounded-lg shadow-lg">
        <input
          type="text"
          required
          placeholder="Enter city name"
          className="border p-3 w-full rounded-md"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          className="bg-slate-600 text-white p-3 mt-2 w-full hover:bg-slate-700 rounded-md"
          onClick={handleClick}
        >
          Show Weather
        </button>

        <label className="inline-flex items-center cursor-pointer mt-4">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={unit === "imperial"}
            onChange={handleUnitToggle}
          />
          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900">
            {unit === "metric" ? "Celsius" : "Fahrenheit"}
          </span>
        </label>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {weather && (
          <div className="mt-4 bg-white p-6 rounded-md shadow-md">
            <h2 className="text-2xl mb-2 font-semibold">{weather.name}</h2>
            <div className="flex flex-col items-center md:flex-row md:items-start mt-5">
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
                className="w-12 h-12"
              />
              <div className="ml-0 md:ml-4">
                <p className="text-lg">
                  <strong>Temperature:</strong> {convertTemperature(weather.main.temp).toFixed(1)} °{unit === "metric" ? "C" : "F"}
                </p>
                <p>
                  <strong>Min Temp:</strong> {convertTemperature(weather.main.temp_min).toFixed(1)} °{unit === "metric" ? "C" : "F"}
                </p>
                <p>
                  <strong>Max Temp:</strong> {convertTemperature(weather.main.temp_max).toFixed(1)} °{unit === "metric" ? "C" : "F"}
                </p>
                <p>
                  <strong>Humidity:</strong> {weather.main.humidity} %
                </p>
                <p>
                  <strong>Wind Speed:</strong> {unit === "metric" ? weather.wind.speed : (weather.wind.speed * 2.237).toFixed(1)} {unit === "metric" ? "m/s" : "mph"}
                </p>
                <p>
                  <strong>Wind Direction:</strong> {weather.wind.deg}°
                </p>
                <p>
                  <strong>Description:</strong> {weather.weather[0].description}
                </p>
              </div>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-md shadow-md">
            <h2 className="text-2xl mb-2 font-semibold">5-Day Forecast</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {forecast.map((day, index) => (
                <div key={index} className="border p-5 rounded-md shadow-sm">
                  <h3 className="text-lg mb-2">{day.date}</h3>
                  <img
                    src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.description}
                    className="w-10 h-10"
                  />
                  <p>
                    <strong>Average Temp:</strong> {convertTemperature(day.temp).toFixed(1)} °{unit === "metric" ? "C" : "F"}
                  </p>
                  <p>
                    <strong>Description:</strong> {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
