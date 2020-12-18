import {getApiKey, queryGeonames, queryPixabay, queryWeatherbit} from './handleAPI.js'

const options = {  year: 'numeric', month: 'long', day: 'numeric'}
const month_abrv = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let count = 0;


/* Creates a string template for the card and returns the full string */
function cardTemplate(location, date, countdown, weather_arr, img, new_loc = false){
  let trip_end = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date_end').value.replace(/-/g, '\/').replace(/T.+/, '')));
  let buttons, weather_items, icon = '';
  weather_arr.forEach((item, i) => {
    let init_date = new Date(date);
    let next_date = new Date(init_date.setDate(init_date.getDate()+i))
    if(item.precip > 5){
      icon = `<img src='./src/client/media/rain.png' class='weather-icon'>`
    }
    else if(item.clouds > 50){
      icon = `<img src='./src/client/media/cloudy.png' class='weather-icon'>`
    }
    else{
      icon = `<img src='./src/client/media/sunny.png' class='weather-icon'>`
    }
    if(weather_items){
      weather_items = weather_items +
      `<div class="trips-card-weather-item">
        ${icon}
        <h5 class="trips-card-weather-item-temp">${item.max}&deg;F / ${item.min}&deg;F</br>${month_abrv[next_date.getMonth()]} ${next_date.getDate()}</h5>
      </div>`
    }
    else{
      weather_items =
      `<div class="trips-card-weather-item">
        ${icon}
        <h5 class="trips-card-weather-item-temp">${item.max}&deg;F / ${item.min}&deg;F</br>${month_abrv[next_date.getMonth()]} ${next_date.getDate()}</h5>
      </div>`
    }

  })
  let trip_card =
            `<div class="trips-card">
              <img src="${img}" alt="Image of ${location}" class="trips-card-photo">
              <div class="trips-card-header">
                <h3>${location}</h3>
                <h4>${date} - ${trip_end}</h4>
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
            </div>`
  if(!new_loc){
  trip_card =
  `<div class="trips-container">
    ${trip_card}
    <div class="trips-container-buttons" data-container="${count}">
      <button type="button" name="new_trip" onclick="return tripFunctions.newTripOverlay(event, ${count})">+ add Location</button>
    </div>
  </div>`
  count++
  return trip_card
}

  return trip_card
}

//When a remove button is clicked, it asks for confirmation then deletes the element.
//If it was the last location, it deletes the entire container
function removeTrip(element){
  let choice = confirm('Are you sure?')
  if(choice === true){
    if(element.parentElement.getElementsByClassName('trips-card').length === 1){
        element.parentElement.remove()
    }
    else{
        element.remove()
    }
  }
}

/*
  Shows the input form overlay. If its to add a location, the submit button is changed slightly to add a new location instead of an
  entire trip.
*/
function newTripOverlay(event, element = null){
  event.stopPropagation()
  event.preventDefault()

  document.querySelector('.new_trip_overlay_input').reset()

  let now = new Date();
  //sets the minimum date to todays date
  document.querySelector('#trip_date').setAttribute('min', `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`);

  //
  document.querySelector('#trip_date_end').addEventListener('click', function(){
    if(document.querySelector('#trip_date').value){
      document.querySelector('#trip_date_end').setAttribute('min', document.querySelector('#trip_date').value);
    }
    else{
      document.querySelector('#trip_date_end').setAttribute('min', `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`);
    }
  })
  document.getElementById('new_trip_overlay').classList.add('flex');

  if(element !== null){
    document.querySelector('.overlay_new_trip').classList.add('hidden')
    document.querySelector('.overlay_new_loc').classList.add('block')
    document.querySelector('.overlay_new_loc').setAttribute('onclick', 'return tripFunctions.addTrip(event, '+element+')')
    document.querySelector('.overlay_new_loc').setAttribute('onsubmit', 'return tripFunctions.addTrip(event, '+element+')')
  }
  else if(element === null && document.querySelector('.overlay_new_trip').classList.contains('hidden')){
    document.querySelector('.overlay_new_trip').classList.remove('hidden')
    document.querySelector('.overlay_new_loc').classList.remove('block')
  }

  if(document.getElementById('new_trip_overlay').classList.contains('flex')){

    window.addEventListener('click', function(e){
      if(!document.querySelector('.new_trip_overlay_input').contains(e.target)){
        document.getElementById('new_trip_overlay').classList.remove('flex');
      }
    })
  }
}

function addTrip(event = null, ele = null){
  if(event !== null){
    event.preventDefault()}
  document.getElementById('new_trip_overlay').classList.remove('flex');
  let location = document.getElementById('trip_location_city').value
  let departure = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''))
  let today = new Date()
  let time_between = departure - today;
  let countdown = Math.floor(time_between / (1000 * 60 * 60 * 24))
  let date = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, '')));
  if(location && date){


    getApiKey('geonamesKey')
    .then(res => queryGeonames(res.application_key, location))
    .then(data => {
      return getApiKey('weatherbitKey')
      .then(res => queryWeatherbit(data.geonames[0].lng, data.geonames[0].lat, data.geonames[0].countryName, res.application_key))
    })
    .then(weather_data => {
      return getApiKey('pixabayKey')
      .then(res => queryPixabay(res.application_key, location, weather_data.country))
      .then(res => {
        if(ele !== null){
          document.getElementsByClassName('trips-container-buttons')[ele].insertAdjacentHTML('beforebegin', cardTemplate(location, date, countdown, weather_data.weather, res.hits[0].webformatURL, true));
        }
        else{
          document.getElementsByClassName('trips')[0].insertAdjacentHTML('beforeend', cardTemplate(location, date, countdown, weather_data.weather, res.hits[0].webformatURL));
        }
      })
    })
    .catch((error) => {
      console.log(error);
      //errorMsg(error);
    })
  }
}


export {newTripOverlay, addTrip, removeTrip}
