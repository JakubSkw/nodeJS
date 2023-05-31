const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const updateDatabase = require('./app');

const app = express();
const port = 4000;

updateDatabase();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

app.use(express.json());

// API endpoint to fetch all weather data
app.get('/api/weather', (req, res) => {
  db.all(`SELECT * FROM weather`, (err, rows) => {
    if (err) {
      console.error('Error retrieving weather data:', err);
      res.status(500).json({ error: 'Error retrieving weather data' });
    } else {
      res.json(rows);
    }
  });
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

// Call the updateDatabase function to update the database periodically (e.g., every hour)
setInterval(() => {
    updateDatabase();
  }, 3600000);