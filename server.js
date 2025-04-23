require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// CORS configuration to allow frontend access
app.use(cors({
  origin: 'https://weatherapp.captianjack.tech',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight (OPTIONS) requests
app.options('*', cors());

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Weather schema
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
  try {
    const data = req.body;
    const weather = new Weather(data);
    await weather.save();
    res.json({ message: "✅ Weather data stored", data });
  } catch (error) {
    console.error("❌ Error storing weather data:", error);
    res.status(500).json({ message: "Error storing weather data", error: error.message });
  }
});

// Get last stored weather data for a city
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const lastWeather = await Weather.findOne({ city }).sort({ timestamp: -1 });
    if (lastWeather) {
      res.json({ message: "✅ Last searched weather", data: lastWeather });
    } else {
      res.status(404).json({ message: "❌ No data found for this city" });
    }
  } catch (error) {
    console.error("❌ Error fetching weather data:", error);
    res.status(500).json({ message: "Error fetching weather data", error: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Internal error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
