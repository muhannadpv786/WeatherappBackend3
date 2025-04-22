require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ CORS Config: allows preflight (OPTIONS) and secure origins
const corsOptions = {
  origin: "https://weatherapp.captianjack.tech",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Explicitly handle preflight requests
app.options("*", cors(corsOptions));

app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Schema
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

// ✅ POST route
app.post("/store_weather", async (req, res) => {
  try {
    const data = req.body;
    const weather = new Weather(data);
    await weather.save();
    res.json({ message: "Weather data stored", data });
  } catch (err) {
    res.status(500).json({ message: "Error storing weather data", error: err.message });
  }
});

// ✅ GET route
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const lastWeather = await Weather.findOne({ city }).sort({ timestamp: -1 });
    if (lastWeather) {
      res.json({ message: "Last searched weather", data: lastWeather });
    } else {
      res.status(404).json({ message: "No data found for this city" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving weather data", error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
