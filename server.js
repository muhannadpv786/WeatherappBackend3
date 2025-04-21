require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const WeatherSchema = new mongoose.Schema({
  city: String,
  country: String,
  temperature: Number,
  feels_like: Number,
  humidity: Number,
  wind_speed: Number,
  weather: String,
  icon: String,
  coordinates: {
    lon: Number,
    lat: Number,
  },
  timestamp: Number,
});

const Weather = mongoose.model("Weather", WeatherSchema);

// Store weather data
app.post("/store_weather", async (req, res) => {
  const data = req.body;
  const weather = new Weather(data);
  await weather.save();
  res.json({ message: "Weather data stored", data });
});

// Get last stored weather data for a city
app.get("/weather/:city", async (req, res) => {
  const city = req.params.city;
  const lastWeather = await Weather.findOne({ city }).sort({ timestamp: -1 });

  if (lastWeather) {
    res.json({ message: "Last searched weather", data: lastWeather });
  } else {
    res.status(404).json({ message: "No data found for this city" });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
