const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/weather', (req, res) => {
  const city = req.body.city;

  axios.get('http://localhost:4000/api/weather')
    .then(response => {
      const weatherData = response.data;

      // Find the weather data for the requested city
      const cityWeather = weatherData.find(data => data.city === city);

      if (cityWeather) {
        const temperature = cityWeather.temperature;
        res.send(`The temperature in ${city} is ${temperature}°C.`);
      } else {
        res.send(`No weather data found for ${city}.`);
      }
    })
    .catch(error => {
      console.error('Error retrieving weather data:', error);
      res.send(`Error retrieving weather data for ${city}.`);
    });
});

app.get('/countries', (req, res) => {
  axios.get('http://localhost:4000/api/weather')
    .then(response => {
      const weatherData = response.data;
      const countries = [...new Set(weatherData.map(data => data.city))];

      res.json(countries);
    })
    .catch(error => {
      console.error('Error retrieving weather data:', error);
      res.status(500).json({ error: 'Error retrieving weather data' });
    });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});