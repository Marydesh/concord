
const searchBtn = document.getElementById("searchButton");
const cityInput = document.getElementById('cityInput');
const citiesDiv = document.getElementById('cities');
const currentDiv = document.getElementById('current');
const futureDiv = document.getElementById('future');
const historyUl = document.getElementById('history');
// searchCities needs to be wrapped in an anon-function so it doesn't automatically get the event object passed to it
searchBtn.addEventListener('click', ()=>{searchCities()});

const myApiKey = "e9b1c62b40d4ec53f934011c833d6262";

// https://openweathermap.org/api
// https://openweathermap.org/forecast16
// https://openweathermap.org/api/one-call-3#how

const weatherURI = (lat, lon) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${myApiKey}&units=imperial`
// getting icons from the font awesome
const icons = {
    cloudy: `<i class="fa-solid fa-cloud"></i>`,
    sunny: `<i class="fa-solid fa-sun"></i>`
}



async function searchCities(query) {
    //console.log('A button was clicked');
    //console.log('You searched for ' + cityInput.value);
    let cityInputValue = query || cityInput.value;
    addToSearchHistory(cityInputValue)
    // console.log("cityInputValue: ", cityInputValue)
    if (!cityInputValue) {
        alert("Please enter a city");
        return null;
    }

// calling weather api /displaying 'loading' when waiting for a result/response data to appear
    let urlString = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInputValue}&limit=10&appid=${myApiKey}`;
    citiesDiv.innerHTML = "Loading..."
    let res = await fetch(urlString)
    let data = await res.json()
    console.log(data)
    if (data.length) {
        displayCities(data)
    } else {
        citiesDiv.innerHTML = "No cities found!"
    }
}

function getSavedHistory() {
    return JSON.parse(localStorage.getItem('concord-searchHistory') || "[]")
}
// save search and render serach history functions to get acces to the cities that we searched for prior
function addToSearchHistory(query) {
    let savedHistory = getSavedHistory()
    savedHistory.push(query)
    if (savedHistory.length > 10) {
        savedHistory.shift()
    }
    localStorage.setItem('concord-searchHistory', JSON.stringify(savedHistory))
    renderSearchHistory()
}

function renderSearchHistory() {
    let savedHistory = getSavedHistory()
    historyUl.innerHTML = ""
    savedHistory.forEach((query,i) => {
        const li = document.createElement('li')
        const historyBtn = document.createElement('button')
        historyBtn.innerText = query
        li.append(historyBtn)
        historyUl.append(li)
        historyBtn.addEventListener('click', ()=>{
            searchCities(query)
        })
    })
}

renderSearchHistory()
// display city function, with an option to slect current weather and a future 5 day forecast
function displayCities(cities) {
    currentDiv.innerHTML = ""
    futureDiv.innerHTML = ""
    citiesDiv.innerHTML = ""
    cities.forEach(city => {
        citiesDiv.innerHTML += `
            <div class="city card">
                <h2>${city.name}, ${city.state}, ${city.country}</h2>
                <button onclick="displayCurrent(${city.lat}, ${city.lon})">Current</button>
                <button onclick="displayFuture(${city.lat}, ${city.lon})">Future</button>
            </div>
        `
    })
}

async function displayCurrent(lat, lon) {
    // Reset
    citiesDiv.innerHTML = ""

    // Fetch
    let res = await fetch(weatherURI(lat, lon))
    let data = await res.json()
    console.log(data)

    // display the current weather + icon conditions
    let current = data.list[0]
    let currentWeather = current.weather[0]
    // console.log("currentWeather: ", currentWeather)
    let cloudy = currentWeather.description.includes("cloud")
    let icon = icons[cloudy ? "cloudy" : "sunny"]

    let date = dayjs(new Date(current.dt_txt)).format('YY.MM.DD hh:ss a')
    currentDiv.innerHTML = `
        <div class="card">
            <h2>${data.city.name}</h2>
            <p>Last updated: ${date}</p>
            <p>Weather: ${currentWeather.description} ${icon}</p>
            <p>Current temperature: ${current.main.temp}&deg;F</p>
            <p>Wind speed: ${current.wind.speed} ${current.wind.deg}&deg;</p>
            <p>Humidity: ${current.main.humidity}%</p>
        </div>
    `
}
// async function to get the latitude and longitude, display the future weather for the city selected based on those values 
async function displayFuture(lat, lon) {
    citiesDiv.innerHTML = ""
    let res = await fetch(weatherURI(lat, lon))
    let data = await res.json()
    let days = []
    for (let i = 0; i < 5; i++) {
        days.push(data.list[i*8])
        days[i].date = dayjs().add(i, 'day').format('YYYY.MM.DD')
    } 
    days.forEach(day => {
        renderDaily(day)
    })
}
// render and display weather information for the specific day. day as a parameter
function renderDaily(day) {
    let currentWeather = day.weather[0]
    console.log("currentWeather: ", currentWeather)
    let cloudy = currentWeather.description.includes("cloud")
    let icon = icons[cloudy ? "cloudy" : "sunny"]
    futureDiv.innerHTML += `
        <div class="daily card">
            <h3>${day.date}</h3>
            <p>Weather: ${day.weather[0].description} ${icon}</p>
            <p>Current temperature: ${day.main.temp}&deg;F</p>
            <p>Wind speed: ${day.wind.speed} ${day.wind.deg}&deg;</p>
            <p>Humidity: ${day.main.humidity}%</p>
        </div>
    `
}