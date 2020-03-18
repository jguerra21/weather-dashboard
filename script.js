//API key from Openweather
var apiKey = 'eb640430dc2a87154a06bcee0cb986c9';
var currentWeatherUrl;
var forecastUrl;
var storedSearches = [];

var searchBar = $('#search-bar');
var searchButton = $('#search-btn');
var searchHistory = $('#search-history');
var weatherCol = $('#weather-col');

//Populates stored searches from local storage
var tempStoredSearches = localStorage.getItem('storedSearches');
if (tempStoredSearches != null) storedSearches = tempStoredSearches.split(',');

//get current date
var today = new Date().toLocaleDateString();

function populateCurrentWeather() {
  $.ajax({
    url: currentWeatherUrl,
    method: 'GET'
  }).then(function(response) {
    var currentWeatherObj = {
      location: response.name,
      date: today,
      weatherIcon: response.weather[0].icon,
      temperature: Math.round(response.main.temp),
      humidity: response.main.humidity,
      wind: response.wind.speed,
      uvIndex: 0,
      uvIntensity: ''
    };

    // UV IDX, LONG,LAT
    var latitude = response.coord.lat;
    var longitude = response.coord.lon;
    var currentUvUrl =
      'https://api.openweathermap.org/data/2.5/uvi?lat=' +
      latitude +
      '&lon=' +
      longitude +
      '&appid=' +
      apiKey;

    $.ajax({
      url: currentUvUrl,
      method: 'GET'
    }).then(function(response2) {
      currentWeatherObj.uvIndex = response2.value;
      if (currentWeatherObj.uvIndex >= 8)
        currentWeatherObj.uvIntensity = 'high';
      else if (currentWeatherObj.uvIndex < 3)
        currentWeatherObj.uvIntensity = 'low';
      else currentWeatherObj.uvIntensity = 'small-uv-icon';

      var currentWeatherCard = $(
        '<div class="card"><div class="card-body"><h5 class="card-title">' +
          currentWeatherObj.location +
          ' (' +
          currentWeatherObj.date +
          ') ' +
          '<span class="badge badge-primary"><img id="weather-icon" src="http://openweathermap.org/img/wn/' +
          currentWeatherObj.weatherIcon +
          '@2x.png"></span></h5>' +
          '<p class="card-text">Temperature: ' +
          currentWeatherObj.temperature +
          ' °F</p>' +
          '<p class="card-text">Humidity: ' +
          currentWeatherObj.humidity +
          '%</p>' +
          '<p class="card-text">Wind Speed: ' +
          currentWeatherObj.wind +
          ' MPH</p>' +
          '<p class="card-text">UV Index: <span class="badge badge-secondary ' +
          currentWeatherObj.uvIntensity +
          '">' +
          currentWeatherObj.uvIndex +
          '</span>'
      );
      $('#weather-col').append(currentWeatherCard);
    });

    renderStoredSearches();
  });
}
function populateWeatherForecast() {
  var fiveDayForecastArray = [];

  //Forecast
  $.ajax({
    url: forecastUrl,
    method: 'GET'
  }).then(function(response) {
    var temporaryForecastObj;

    //Weather data
    for (var i = 4; i < response.list.length; i += 8) {
      temporaryForecastObj = {
        date: response.list[i].dt_txt.split(' ')[0],
        weatherIcon: response.list[i].weather[0].icon,
        temperature: Math.round(response.list[i].main.temp),
        humidity: response.list[i].main.humidity
      };
      fiveDayForecastArray.push(temporaryForecastObj);
    }

    //Foreceast arrays
    for (var i = 0; i < fiveDayForecastArray.length; i++) {
      fiveDayForecastArray[i].date = formatDates(fiveDayForecastArray[i].date);
    }
    var forecastHeader = $('<h5>5-Day Forecast:</h5>');
    $('#forecast-header').append(forecastHeader);

    for (var i = 0; i < fiveDayForecastArray.length; i++) {
      var forecastCard = $(
        '<div class="col-lg-2 col-sm-3 mb-3 mr-3"><span class="badge badge-primary"><h5>' +
          fiveDayForecastArray[i].date +
          '</h5>' +
          '<p><img class="w-100" src="http://openweathermap.org/img/wn/' +
          fiveDayForecastArray[i].weatherIcon +
          '@2x.png"></p>' +
          '<p>Temp: ' +
          fiveDayForecastArray[i].temperature +
          '°F</p>' +
          '<p>Humidity: ' +
          fiveDayForecastArray[i].humidity +
          '%</p>' +
          '<span></div>'
      );
      $('#forecast-row').append(forecastCard);
    }
  });
}
//Search bar
function renderStoredSearches() {
  $('#search-history').empty();
  if ($('#search-bar').val() != '') {
    if (storedSearches.indexOf($('#search-bar').val()) != -1) {
      storedSearches.splice(storedSearches.indexOf($('#search-bar').val()), 1);
    }
    storedSearches.unshift($('#search-bar').val());
  }

  //Save to local storage
  localStorage.setItem('storedSearches', storedSearches);

  //search history
  for (var i = 0; i < storedSearches.length; i++) {
    var newListItem = $(
      '<li class="list-group-item">' + storedSearches[i] + '</li>'
    );
    $('#search-history').append(newListItem);
  }
  $('li').on('click', function() {
    $('#search-bar').val($(event.target).text());
    searchButton.click();
  });
}

//Modify date format to: month/day/year
function formatDates(data) {
  var dateArray = data.split('-');
  var formattedDate = dateArray[1] + '/' + dateArray[2] + '/' + dateArray[0];
  return formattedDate;
}
//Search button
searchButton.on('click', function() {
  currentWeatherUrl =
    'https://api.openweathermap.org/data/2.5/weather?q=' +
    searchBar.val() +
    '&units=imperial&appid=' +
    apiKey;
  forecastUrl =
    'https://api.openweathermap.org/data/2.5/forecast?q=' +
    searchBar.val() +
    '&units=imperial&appid=' +
    apiKey;
  $('#weather-col').empty();
  $('#forecast-header').empty();
  $('#forecast-row').empty();

  populateCurrentWeather();
  populateWeatherForecast();
});

// Enter and save each Input search
$('#search-bar').keypress(function() {
  if (event.keyCode == 13) searchButton.click();
});

renderStoredSearches();
