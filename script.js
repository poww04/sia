const apiKey = 'ba1e042639b74709b5c55915252304'; // Your real API key

async function getWeather() {
    document.getElementById('inputSection').style.display = 'block';
    const city = document.getElementById('cityInput').value.trim();

    if (!city) {
        document.getElementById('weatherResult').innerHTML = "<p>Please enter a city name.</p>";
        return;
    }

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=no`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.error) {
            document.getElementById('weatherResult').innerHTML = `<p>City not found. Please try again.</p>`;
            return;
        }

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let weekWeatherHTML = '';

        data.forecast.forecastday.forEach((forecast, index) => {
            const dayDate = new Date(forecast.date);
            const dayName = daysOfWeek[dayDate.getDay()];
            const weather = forecast.day.condition.text;
            const temperature = forecast.day.avgtemp_c;
            const humidity = forecast.day.avghumidity;
            const wind = forecast.day.maxwind_kph;
            const weatherIcon = getWeatherIcon(weather);

            weekWeatherHTML += `
                <div class="day-card" onclick="showHourlyWeather(${index})">
                    <h3>${dayName}</h3>
                    <p>${dayDate.toLocaleDateString()}</p>
                    <img src="${weatherIcon}" alt="${weather}" style="width: 50px; height: 50px;" />
                    <p><strong>${weather}</strong></p>
                    <p><strong>${temperature}°C</strong></p><br>
                    <p>💧 Humidity: ${humidity}%</p><br>
                    <p>🌬️ Wind: ${wind} km/h</p>
                </div>
            `;
        });

        document.getElementById('weatherResult').innerHTML = `
            <div class="weather-header">
                <button onclick="goBackToDefaultLocation()" class="back-button">
                    <img src="images/back.png" alt="Back to Default" style="width: 30px; height: 30px;" />
                </button>
                <h2>Weather Forecast for ${city}</h2>
            </div>
            <div id="weekWeather">${weekWeatherHTML}</div>
        `;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById('weatherResult').innerHTML = `<p>Error fetching weather data. Please try again later.</p>`;
    }
}

function showHourlyWeather(dayIndex) {
    document.getElementById('inputSection').style.display = 'none';
    const city = document.getElementById('cityInput').value.trim();
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=no`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const day = data.forecast.forecastday[dayIndex];
            const date = new Date(day.date);
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            let hourlyWeatherHTML = `
                <div class="hourly-header">
                    <div class="hourly-header-content">
                        <button onclick="goBackToWeeklyWeather()" class="back-button">
                            <img src="images/back.png" alt="Back" style="width: 30px; height: 30px;" />
                        </button>
                        <h3>Hourly Weather for ${formattedDate}</h3>
                    </div>
                </div>
                <div id="hourlyWeather">
            `;

            day.hour.forEach(hourData => {
                const hour = new Date(hourData.time).getHours();
                const temperature = hourData.temp_c;
                const condition = hourData.condition.text;
                const humidity = hourData.humidity;
                const wind = hourData.wind_kph;
                const weatherIcon = getWeatherIcon(condition);

                hourlyWeatherHTML += `
                    <div class="hour-card">
                        <h4>${hour}:00</h4>
                        <img src="${weatherIcon}" alt="${condition}" />
                        <p>${condition}</p>
                        <p>${temperature}°C</p>
                        <p>💧 Humidity: ${humidity}%</p>
                        <p>🌬️ Wind: ${wind} km/h</p>
                    </div>
                `;
            });

            hourlyWeatherHTML += `</div>`;
            document.getElementById('weatherResult').innerHTML = hourlyWeatherHTML;
        })
        .catch(error => {
            console.error(error);
            document.getElementById('weatherResult').innerHTML = "<p>Error fetching hourly data. Please try again later.</p>";
        });
}

function goBackToWeeklyWeather() {
    document.getElementById('inputSection').style.display = 'block';
    getWeather();
}

function getWeatherIcon(condition) {
    const normalized = condition.toLowerCase();
    const path = 'images/';

    if (normalized.includes('clear') || normalized.includes('sunny')) return path + 'sun.gif';
    if (normalized.includes('cloudy')) return path + 'cloudy.gif';

    switch (normalized) {
        case 'rainy': return path + 'rainy-animated.gif';
        case 'moderate rain':
        case 'moderate rain at times': return path + 'moderateR.gif';
        case 'snowy': return path + 'snow.gif';
        case 'patchy rain nearby': return path + 'rainnear.gif';
        case 'patchy snow nearby': return path + 'snowsnear.gif';
        case 'light rain shower': return path + 'rainli.gif';
        case 'heavy rain': return path + 'heavyR.gif';
        case 'showers': return path + 'showers.gif';
        case 'thunderstorms': return path + 'thunderstorms.gif';
        case 'patchy light rain': return path + 'drop.gif';
        case 'patchy light drizzle': return path + 'weather.gif';
        default: return '';
    }
}

async function getDefaultLocationWeather() {
    if (!navigator.geolocation) {
        document.getElementById('weatherResult').innerHTML = "<p>Geolocation is not supported by your browser.</p>";
        return;
    }

    navigator.geolocation.getCurrentPosition(async position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const city = data.location.name;
            const weather = data.current.condition.text;
            const temperature = data.current.temp_c;
            const humidity = data.current.humidity;
            const wind = data.current.wind_kph;
            const weatherIcon = getWeatherIcon(weather);

            document.getElementById('weatherResult').innerHTML = `
                <div class="default-center">
                    <div class="weather-card">
                        <h2>Today</h2>
                        <h3>${city}</h3>
                        <img src="${weatherIcon}" alt="${weather}" style="width: 60px; height: 60px;" />
                        <p><strong>${weather}</strong></p>
                        <p style="font-size: 28px;"><strong>${temperature}°C</strong></p>
                        <p>💧 Humidity: ${humidity}%</p>
                        <p>🌬️ Wind: ${wind} km/h</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(error);
            document.getElementById('weatherResult').innerHTML = "<p>Error fetching location weather.</p>";
        }
    }, error => {
        console.error(error);
        document.getElementById('weatherResult').innerHTML = "<p>Unable to retrieve your location.</p>";
    });
}

function goBackToDefaultLocation() {
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('cityInput').value = '';
    getDefaultLocationWeather();
}

window.onload = getDefaultLocationWeather;
