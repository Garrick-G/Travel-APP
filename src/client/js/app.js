import {queryGeonames, queryPixabay, queryWeatherbit, getApiKeys, getTripData, postToServer} from './handleAPI.js';

const options = {year: 'numeric', month: 'long', day: 'numeric'};
const month_abrv = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let count = 0;

/* Creates a string template for the card and returns the full string */
const cardTemplate = (location, date_start, date_end, countdown, weather_arr, img, new_loc = false) => {

  // initializes variables to store HTML
  let weather_items; let icon = '';

  // Loop through all 7 days of the weather to set up the forcast including icons
  weather_arr.forEach((item, i) => {
    const init_date = new Date(date_start);
    const next_date = new Date(init_date.setDate(init_date.getDate()+i));
    if (item.precip > 5) {
      icon = `<img src='./src/client/media/rain.png' class='weather-icon'>`;
    } else if (item.clouds > 50) {
      icon = `<img src='./src/client/media/cloudy.png' class='weather-icon'>`;
    } else {
      icon = `<img src='./src/client/media/sunny.png' class='weather-icon'>`;
    }
    if (weather_items) {
      weather_items = weather_items +
      `<div class="trips-card-weather-item">
        ${icon}
        <h5 class="trips-card-weather-item-temp">${item.max}&deg;F / ${item.min}&deg;F</br>${month_abrv[next_date.getMonth()]} ${next_date.getDate()}</h5>
      </div>`;
    } else {
      weather_items =
      `<div class="trips-card-weather-item">
        ${icon}
        <h5 class="trips-card-weather-item-temp">${item.max}&deg;F / ${item.min}&deg;F</br>${month_abrv[next_date.getMonth()]} ${next_date.getDate()}</h5>
      </div>`;
    }
  });
  // Sets up HTML for the card
  let trip_card =
            `<div class="trips-card">
              <img src="${img}" alt="Image of ${location}" class="trips-card-photo">
              <div class="trips-card-header">
                <h2>${location}</h2>
                <h4>${date_start} - ${date_end}</h4>
              </div>
              <div class="trips-card-countdown">
                <h3>${countdown} days left!</h3>
              </div>
              <div class="trips-card-weather">
                <h4 class="trips-card-weather-header">Typical Weather for that time of year:</h4>
                ${weather_items}
              </div>
              <div class="remove-trip">
                <button type="button" name="remove-trip" onclick="return tripFunctions.removeTrip(this.closest('.trips-card'))">Remove Location</button>
              </div>
            </div>`;

  // If it is the first location, add a container around the trip
  if (!new_loc) {
    trip_card =
  `<div class="trips-container">
    ${trip_card}
    <div class="trips-container-buttons" data-container="${count}">
      <button type="button" name="new_trip" onclick="return tripFunctions.newTripOverlay(event, ${count})">+ add Location</button>
    </div>
  </div>`;
    count++;
    return trip_card;
  }

  return trip_card;
}

// When a remove button is clicked, it asks for confirmation then deletes the element.
// If it was the last location, it deletes the entire container
const removeTrip = (element) =>{
  const choice = confirm('Are you sure?');
  if (choice === true) {
    if (element.parentElement.getElementsByClassName('trips-card').length === 1) {
      element.parentElement.remove();
    } else {
      element.remove();
    }
  }
}


/*
  Shows the input form overlay. If its to add a location, the submit button is changed slightly to add a new location instead of an
  entire trip.
*/
const newTripOverlay = (event, element = null) => {
  event.stopPropagation();
  event.preventDefault();

  // Resets the form
  document.querySelector('.new_trip_overlay_input').reset();

  const now = new Date();
  // sets the minimum date to todays date
  document.querySelector('#trip_date').setAttribute('min', `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`);

  // When the end-date is clicked on, set the minimum to the value of the begin date, or to todays date
  document.querySelector('#trip_date_end').addEventListener('click', function() {
    if (document.querySelector('#trip_date').value) {
      document.querySelector('#trip_date_end').setAttribute('min', document.querySelector('#trip_date').value);
    } else {
      document.querySelector('#trip_date_end').setAttribute('min', `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`);
    }
  });
  // Shows the input overlay
  document.getElementById('new_trip_overlay').classList.add('flex');
  // If the input is for a new location, change the submit button
  if (element !== null) {
    document.querySelector('.overlay_new_trip').classList.add('hidden');
    document.querySelector('.overlay_new_loc').classList.add('block');
    document.querySelector('.overlay_new_loc').setAttribute('onclick', 'return tripFunctions.addTrip(event, '+element+')');
    document.querySelector('.overlay_new_loc').setAttribute('onsubmit', 'return tripFunctions.addTrip(event, '+element+')');
  }
  // If the input is for a new trip but the submit is still for a new location, change everything to default
  else if (element === null && document.querySelector('.overlay_new_trip').classList.contains('hidden')) {
    document.querySelector('.overlay_new_trip').classList.remove('hidden');
    document.querySelector('.overlay_new_loc').classList.remove('block');
  }

  if (document.getElementById('new_trip_overlay').classList.contains('flex')) {
    window.addEventListener('click', function(e) {
      if (!document.querySelector('.new_trip_overlay_input').contains(e.target)) {
        document.getElementById('new_trip_overlay').classList.remove('flex');
      }
    });
  }
}

// Gets dates and chains all the API calls to set up the card
const addTrip = (event = null, ele = null) => {
  if (event !== null) {
    event.preventDefault();
  }
  document.getElementById('new_trip_overlay').classList.remove('flex');
  //Gets location data from the UI
  const location = document.getElementById('trip_location_city').value;
  //Gets date from the UI and formats it
  const departure = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''));
  const today = new Date();
  const time_between = departure - today;
  const countdown = Math.floor(time_between / (1000 * 60 * 60 * 24));
  const date_begin = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, '')));
  const date_end = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date_end').value.replace(/-/g, '\/').replace(/T.+/, '')));
  if (location && date_begin) {
    getApiKeys()
        .then((res) => {
          queryGeonames(res.geonames, location)
              .then((data) => queryWeatherbit(data.geonames[0].lng, data.geonames[0].lat, data.geonames[0].countryName, res.weatherbit))
              .then((weather_data) => {
                queryPixabay(res.pixabay, location, weather_data.country)
                    .then((res) => {
                      let date_obj = {location: location, begin: date_begin, end: date_end, countdown: countdown, weather: weather_data.weather, img: res.hits[0].webformatURL}
                      postToServer(date_obj)
                      .then(() => {
                        getTripData()
                        .then(res => {
                          if (ele !== null) {
                            document.getElementsByClassName('trips-container-buttons')[ele].insertAdjacentHTML('beforebegin', cardTemplate(res.location, res.begin, res.end, res.countdown, res.weather, res.img, true));
                          } else {
                            document.getElementsByClassName('trips')[0].insertAdjacentHTML('beforeend', cardTemplate(res.location, res.begin, res.end, res.countdown, res.weather, res.img));
                          }
                        })
                      })
                    })
              })
          })
        }
  }


export {newTripOverlay, addTrip, removeTrip};
