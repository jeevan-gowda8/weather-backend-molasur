// =========================================================================
// Weather Station Telemetry Simulator
// Sends realistic solar weather sensor data every 1.5 minutes (90 seconds)
// Target: https://weather.jeevangowda.xyz/api/weather
// API Key: dev_key_5e6re1zta
// =========================================================================

const TARGET_URL = 'https://weather.jeevangowda.xyz/api/weather';
const DEVICE_API_KEY = 'dev_key_5e6re1zta';
const INTERVAL_MS = 1.5 * 60 * 1000; // 1.5 minutes = 90,000 ms

let transmissionCount = 0;

// Compass point conversion helper
function getCardinalDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degrees % 360) / 22.5) % 16;
    return directions[index];
}

// Generate realistic fluctuating solar weather metrics
function generateWeatherData() {
    const now = new Date();
    const hour = now.getHours();

    // Solar Radiation profile based on time of day (W/m^2)
    let solarRadiation = 0;
    if (hour >= 6 && hour <= 18) {
        // Peak radiation around solar noon (12-1 PM)
        const peakFactor = Math.sin(((hour - 6) / 12) * Math.PI);
        solarRadiation = Math.round(peakFactor * 850 + (Math.random() * 80 - 40));
        solarRadiation = Math.max(0, solarRadiation);
    } else {
        solarRadiation = 0;
    }

    // Temperature (°C) - varies with solar radiation
    const baseTemp = 26.0 + (solarRadiation > 0 ? (solarRadiation / 900) * 8.0 : -2.0);
    const temp = parseFloat((baseTemp + (Math.random() * 2.0 - 1.0)).toFixed(2));

    // Relative Humidity (%) - inverse to temperature
    const baseHumid = 65.0 - (solarRadiation > 0 ? (solarRadiation / 900) * 20.0 : -10.0);
    const humid = parseFloat((baseHumid + (Math.random() * 4.0 - 2.0)).toFixed(2));

    // Atmospheric Pressure (hPa)
    const press = parseFloat((1012.5 + (Math.random() * 4.0 - 2.0)).toFixed(2));

    // UV Index (0 - 11+)
    const uv = solarRadiation > 0 ? parseFloat(((solarRadiation / 850) * 8.5 + (Math.random() * 0.5)).toFixed(1)) : 0.0;

    // Wind Speed (m/s) & Direction (0 - 359°)
    const wind_speed = parseFloat((2.5 + Math.random() * 5.5).toFixed(2));
    const wind_dir = Math.floor(Math.random() * 360);
    const wind_dir_str = getCardinalDirection(wind_dir);

    // Rainfall (mm) - mostly 0.0 with occasional light drizzle
    const rain = Math.random() < 0.15 ? parseFloat((Math.random() * 1.5).toFixed(2)) : 0.0;

    // Air Quality PM2.5 / PM10 (ug/m^3)
    const pm25 = parseFloat((15.0 + Math.random() * 25.0).toFixed(1));
    const pm10 = parseFloat((pm25 + 10.0 + Math.random() * 20.0).toFixed(1));

    return {
        apiKey: DEVICE_API_KEY,
        temp,
        humid,
        press,
        rain,
        solar: solarRadiation,
        uv,
        wind_speed,
        wind_dir,
        wind_dir_str,
        pm25,
        pm10
    };
}

// Transmission routine
async function transmitTelemetry() {
    transmissionCount++;
    const payload = generateWeatherData();
    const timestamp = new Date().toLocaleTimeString();

    console.log(`\n=============================================================`);
    console.log(`[#${transmissionCount}] [${timestamp}] Sending Telemetry Transmission...`);
    console.log(`Target: ${TARGET_URL}`);
    console.log(`Payload:`, JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`✅ [SUCCESS] Server responded with HTTP ${response.status} (${response.statusText || 'OK'})`);
            console.log(`Data stored successfully in database for apiKey: ${DEVICE_API_KEY}`);
        } else {
            const errorText = await response.text();
            console.error(`❌ [SERVER ERROR] HTTP ${response.status}: ${errorText}`);
        }
    } catch (err) {
        console.error(`❌ [NETWORK ERROR] Failed to connect to server:`, err.message);
    }

    const nextTime = new Date(Date.now() + INTERVAL_MS).toLocaleTimeString();
    console.log(`Next transmission scheduled in 1.5 minutes (at ${nextTime})...`);
    console.log(`=============================================================`);
}

// Banner & Scheduler Startup
console.log(`\n*************************************************************`);
console.log(`       Solar Weather Station Telemetry Simulator            `);
console.log(`*************************************************************`);
console.log(` Target Endpoint:   ${TARGET_URL}`);
console.log(` Device API Key:    ${DEVICE_API_KEY}`);
console.log(` Transmission Rate: Every 1.5 minutes (${INTERVAL_MS / 1000}s)`);
console.log(` Press Ctrl+C to terminate simulator`);
console.log(`*************************************************************\n`);

// 1. Initial transmission immediately on start
transmitTelemetry();

// 2. Scheduled recurring transmission every 1.5 minutes
setInterval(transmitTelemetry, INTERVAL_MS);
