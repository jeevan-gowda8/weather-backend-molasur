# weather-backend-molasur

Automated solar weather station telemetry simulator that sends sensor data every 1.5 minutes to `https://weather.jeevangowda.xyz/api/weather` for device `dev_key_5e6re1zta`.

## Features
- Real-time simulated solar radiation, temperature, humidity, pressure, UV index, wind speed, wind direction, PM2.5, PM10, and rainfall.
- Scheduled transmission every 1.5 minutes (90 seconds).
- Automatic logging of payloads and HTTP status responses.

## Usage
```bash
npm start
```
or
```bash
node simulator.js
```
