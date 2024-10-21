const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3003;
const secretKey = '2112'; // Replace with a secure key
const weatherAPIKey = 'd6bb3c3ce9325520fd779581080b0c9e'; // Replace with your OpenWeatherMap API key

app.use(cors());
app.use(bodyParser.json());

const users = [];
const items = {
  clothing: [
    { id: 1, name: "Jacket" },
    { id: 2, name: "Jeans" },
    { id: 3, name: "T-shirt" },
  ],
  electronics: [
    { id: 4, name: "Laptop" },
    { id: 5, name: "Smartphone" },
    { id: 6, name: "Tablet" },
  ],
};

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.json({ message: 'Signup successful', redirect: '/login' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token, redirect: '/shop' });
});

// Shopping items
app.get('/shop', (req, res) => {
  res.json({ categories: items });
});

// Checkout
app.post('/checkout', (req, res) => {
  res.json({ message: 'Purchase completed', redirect: '/confirmation' });
});

// Current weather route
app.get('/weather', async (req, res) => {
  try {
    const city = req.query.city || 'Chattogram';
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`
    );
    const weatherData = weatherResponse.data;
    res.json({
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      city: weatherData.name,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weather' });
  }
});

// Redirect to weather website
app.get('/weather-redirect', (req, res) => {
  const city = req.query.city || 'Chattogram';
  res.redirect(`https://openweathermap.org/city?q=${city}`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
