const weatherDisplay = document.querySelector(".weather-display")
const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");
const getWeatherBtn = document.querySelector(".button");
const cityId = document.querySelector(".city-identifier");
const tempId = document.querySelector(".temp-identifier")
const skyCover = document.querySelector(".sky-cover");
const humidity = document.querySelector(".humidity");
const windSpeed = document.querySelector(".wind-speed");
const weatherPic = document.querySelector(".weather-picture");
const addHomeCity = document.getElementById("addHomeCity")
const fieldSet = document.querySelector("fieldset");
const formReset = document.getElementById("formReset")
const favoriteCities = [];
let cityLat;
let cityLon;
let cityParam;
let stateParam;
addHomeCity.addEventListener("click", addFavorite);
getWeatherBtn.addEventListener("click", weatherFetch);
document.addEventListener(`readystatechange`, getFavorites); //keeps local storage to save favorites

//builds state option drop down menu
const stateArr = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
stateArr.forEach((ele) => {
  const option = document.createElement("option");
  option.textContent = ele;
  stateSelect.appendChild(option);
});

function weatherFetch(event) {
  event.preventDefault();
   cityParam = citySelect.value;
   stateParam = state.value;
  //have to get latitude and longitude of city/state first
  const fetchLatLonCity = fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${cityParam},${stateParam},&limit=1&appid=d986223eb010b1fb6e62744eca1ba202`
  );
  
  fetchLatLonCity
  .then((res) => res.json())
    .then((data) => {
         cityLat = data[0].lat;
         cityLon = data[0].lon;
         //use lat/lon to fetch weather data
        const fetchWeather = fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&units=imperial&appid=d986223eb010b1fb6e62744eca1ba202`
        )
        fetchWeather
        .then((res) => res.json())
        .then((data) => {
            updateWeather(data);
        })
        .catch((err) => {
            console.log(err);
        });
        
    })
    .catch((err) => {
        console.log(err);
    });

    //set input fields back to default
    formReset.reset();
}


//populates weather display, called in fetch request
function updateWeather(data) {
    cityId.textContent = `City: ${data.name}`;
    tempId.textContent = `Temperature: ${Math.trunc(data.main.temp)}F`;
    skyCover.textContent = `Conditions: ${data.weather[0].main}`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed}MPH`;
    addHomeCity.style.display = "block";
    changeImage();
}

//reveals weather icon depicting current conditions. matches condition data to image sources and background colors
function changeImage() {
 const conditionImages = [
  {condition: `Cloud`, src: `./weatherIcons/cloudy.gif`, background: `grey`},
  {condition: `Fog`, src: `./weatherIcons/fog.gif`, background: `lightgrey`},
  {condition: `Mist`, src: `./weatherIcons/fog.gif`, background: `lightgrey`},
  {condition: `Rain`, src: `./weatherIcons/rainfall.gif`, background: `#471b58`},
  {condition: `Snow`, src: `./weatherIcons/snow.gif`, background: `lightblue`},
  {condition: `Sun`, src: `./weatherIcons/sun.gif`, background: `gold`},
  {condition: `Clear`, src: `./weatherIcons/sun.gif`, background: `gold`}
]
  conditionImages.forEach((ele) => {
    if(skyCover.textContent.includes(ele.condition)) {
      weatherPic.src = ele.src;
      weatherPic.style.display = "block";
      weatherDisplay.style.backgroundColor = ele.background;
    }
  })
}

//adds a favorite location based on current weather location selected
function addFavorite() {
  //saves location information to refetch weather data
let newFav = {
  city: cityParam,
  state: stateParam,
  latitude: cityLat,
  longitude: cityLon
}
favoriteCities.push(newFav);
storeFavorites(); //stores favoriteCities array in local storage

//DOM manipulation to add radio input field
fieldSet.innerHTML = "";
const legend = document.createElement(`legend`)
legend.textContent = "Favorite Locations";
fieldSet.appendChild(legend);

favoriteCities.forEach((ele) => {
    buildFavList(ele);
})
}

//uses the stored lat and lon data to fetch the weather from a saved favorite
function updateFavWeather(event) {
  const fetchWeather = fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${event.target.getAttribute("lat")}&lon=${event.target.getAttribute("lon")}&units=imperial&appid=d986223eb010b1fb6e62744eca1ba202`
  )
  fetchWeather
  .then((res) => res.json())
  .then((data) => {
      updateWeather(data);
  })
  .catch((err) => {
      console.log(err);
  });

}

//function for DOM building the favorites list. The element is an array item being passed in with forEach on the favoriteCity array
function buildFavList (ele) {
let newDiv = document.createElement(`div`)
    newDiv.class = "radio-div"
    let newInput = document.createElement(`input`)
    let newLabel = document.createElement(`label`);
    newInput.type = "radio";
    newInput.id = ele.city;
    newInput.name = "favorites";
    newInput.value = ele.city;
    newInput.setAttribute("lat", ele.latitude) 
    newInput.setAttribute("lon", ele.longitude) 
    newLabel.for = ele.city;
    newLabel.textContent = `${ele.city}, ${ele.state}`;
    newDiv.appendChild(newInput);
    newDiv.appendChild(newLabel);
    fieldSet.appendChild(newDiv);
    newInput.addEventListener("change", updateFavWeather);
}


//Local storage to keep favorites list
function storeFavorites() {
  window.localStorage.removeItem(`favorites`);
  let jsonObj = JSON.stringify(favoriteCities);
  localStorage.setItem(`favorites`, jsonObj);
}

function getFavorites() {
  let jsonObj = window.localStorage.getItem(`favorites`);
  let parse = JSON.parse(jsonObj);
    parse.forEach((ele) => {
      buildFavList(ele);
  })

}
