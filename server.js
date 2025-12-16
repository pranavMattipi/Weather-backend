import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Weather backend running...");
});

// Weather API route
app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server misconfigured: WEATHER_API_KEY missing" });
    }

    if (!city) {
      return res.status(400).json({ error: "City name is required" });
    }

    const encodedCity = encodeURIComponent(city);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);

    const data = response.data;

    return res.json({
      city: data.name,
      temp: data.main?.temp,
      humidity: data.main?.humidity,
      wind: data.wind?.speed,
      condition: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon,
    });
  } catch (error) {
    // If OpenWeather returned a 4xx/5xx, forward meaningful info where possible
    if (error.response) {
      const status = error.response.status === 404 ? 404 : 502;
      return res.status(status).json({
        error: "Weather API error",
        details: error.response.data || error.response.statusText,
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
