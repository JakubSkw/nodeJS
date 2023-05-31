const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const fs = require('fs');



const updateDatabase = () => {
  const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  // SQLite database connection code
  db.serialize(() => {
    db.run(
      `
    CREATE TABLE IF NOT EXISTS weather (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT,
      temperature REAL,
      condition TEXT
    )
  `,
      (err) => {
        if (err) {
          console.error('Error creating weather table:', err);
        } else {
          console.log('Weather table created or already exists');

          // Delete existing data from the table
          db.run(`DELETE FROM weather`, (err) => {
            if (err) {
              console.error('Error deleting weather data:', err);
            } else {
              console.log('Weather data deleted from the table');

              // Set the API endpoint URL
              const url = 'https://api.weatherapi.com/v1/current.json';

              // Set your API key
              const apiKey = '33613de749a74ce69a5123042233105';

              // Set the locations for which you want to retrieve the weather
              const locations = ['New York', 'London', 'Tokyo']; // Example cities

              // Read the 'capitals.json' file
              fs.readFile('./capitals.json', 'utf8', (err, data) => {
                if (err) {
                  console.error('Error reading capitals.json:', err);
                } else {
                  try {
                    // Parse the JSON data
                    const capitals = JSON.parse(data);

                    // Extract the city names and add them to the locations array
                    const capitalNames = capitals.map((capital) => capital.city);
                    locations.push(...capitalNames);

                    // Variable to keep track of API requests completion
                    let completedRequests = 0;

                    // Make API requests for each location
                    locations.forEach((location) => {
                      axios
                        .get(url, {
                          params: {
                            key: apiKey,
                            q: location,
                          },
                        })
                        .then((response) => {
                          // Access the weather data in JSON format
                          const weatherData = response.data;

                          // Insert the weather data into the database
                          db.run(
                            `
                          INSERT INTO weather (city, temperature, condition)
                          VALUES (?, ?, ?)
                        `,
                            [
                              weatherData.location.name,
                              weatherData.current.temp_c,
                              weatherData.current.condition.text,
                            ],
                            (err) => {
                              if (err) {
                                console.error('Error inserting weather data:', err);
                              } else {
                                console.log('Weather data inserted into the database');
                              }
                            }
                          );
                        })
                        .catch((error) => {
                          console.error(
                            `Error retrieving weather data for ${location}:`,
                            error.message
                          );
                        })
                        .finally(() => {
                          completedRequests++;

                          // Check if all API requests are complete
                          if (completedRequests === locations.length) {
                            // Close the database connection when all API requests are complete
                            db.close((err) => {
                              if (err) {
                                console.error(err.message);
                              } else {
                                console.log('Database connection closed.');
                              }
                            });
                          }
                        });
                    });
                  } catch (error) {
                    console.error('Error parsing capitals.json:', error);
                  }
                }
              });
            }
          });
        }
      }
    );
  });
};

module.exports = updateDatabase 