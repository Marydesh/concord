
const searchBtn = document.getElementById("searchButton");
const cityInput = document.getElementById('cityInput');
const citiesDiv = document.getElementById('cities');
const currentDiv = document.getElementById('current');
//console.log(cityInput, typeof cityInput);
searchBtn.addEventListener('click', searchCities);

const myApiKey = "e9b1c62b40d4ec53f934011c833d6262";

// https://openweathermap.org/api/one-call-3#how
const weatherURI = (lat, lon) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${myApiKey}&units=imperial`

/*
^ above statment is same as below
function weatherURI(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${myApiKey}`
}
*/



async function searchCities() {
    //console.log('A button was clicked');
    //console.log('You searched for ' + cityInput.value);
    let cityInputValue = cityInput.value;
    addToSearchHistory(cityInputValue)
    // console.log("cityInputValue: ", cityInputValue)
    if (!cityInputValue) {
        alert("Please enter a city");
        return null;
    }


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

function addToSearchHistory(query) {
    let savedHistory = JSON.parse(localStorage.getItem('concord-searchHistory') || "[]")
    savedHistory.push(query)
    localStorage.setItem('concord-searchHistory', JSON.stringify(savedHistory))
}

function displayCities(cities) {
    citiesDiv.innerHTML = ""
    cities.forEach(city => {
        citiesDiv.innerHTML += `
            <div class="city">
                <h2>${city.name}, ${city.state}, ${city.country}</h2>
                <button onclick="displayCurrent(${city.lat}, ${city.lon})">Current</button>
                <button onclick="displayFuture(${city.lat}, ${city.lon})">Future</button>
            </div>
        `
    })
}

async function displayCurrent(lat, lon) {
    citiesDiv.innerHTML = ""
    let res = await fetch(weatherURI(lat, lon))
    let data = await res.json()
    console.log(data)
    let current = data.list[0]
    let date = dayjs(new Date(current.dt_txt)).format('YY.MM.DD hh:ss a')
    currentDiv.innerHTML = `
        <h2>${data.city.name}</h2>
        <p>Last updated: ${date}</p>
        <p>Weather: ${current.weather[0].description}</p>
        <p>Current temperature: ${current.main.temp}&deg;F</p>
        <p>Wind speed: ${current.wind.speed} ${current.wind.deg}&deg;</p>
        <p>Humidity: ${current.main.humidity}%</p>
    `
}

async function displayFuture(lat, lon) {
    console.log(lat, lon)   
}