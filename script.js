
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");
const searchButton = form.querySelector("button");

function getWeatherDescription(code) {
  const conditions = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    61: ["Light rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "🌨️"],
    75: ["Heavy snow", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Rain showers", "🌧️"],
    82: ["Heavy showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Severe thunderstorm", "⛈️"]
  };

  return conditions[code] || ["Variable conditions", "🌍"];
}

async function fetchWeather(city) {
  searchButton.disabled = true;
  searchButton.textContent = "Loading...";
  message.textContent = "Fetching weather data...";
  weatherCard.hidden = true;

  try {
    // Step 1: Find the city's latitude and longitude.
    const geoURL =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error("Unable to search for the city.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the spelling.");
    }

    const place = geoData.results[0];

    // Step 2: Request current weather using the coordinates.
    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error("Unable to retrieve weather data.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error("Weather information is unavailable.");
    }

    // Step 3: Display the data on the webpage.
    const [description, icon] =
      getWeatherDescription(current.weather_code);

    document.getElementById("location").textContent =
      `${place.name}, ${place.country}`;

    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("weatherIcon").textContent = icon;

    document.getElementById("description").textContent =
      description;

    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${current.wind_speed_10m} km/h`;

    document.getElementById("updated").textContent =
      `Weather observation: ${current.time.replace("T", " ")}`;

    weatherCard.hidden = false;
    message.textContent = "Weather loaded successfully!";

  } catch (error) {
    message.textContent =
      error instanceof TypeError
        ? "Network error. Check your internet connection and try again."
        : error.message || "Something went wrong. Please try again.";
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city) {
    fetchWeather(city);
  }
});
