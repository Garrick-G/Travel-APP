import {getApiKey, queryGeonames, queryPixabay, queryWeatherbit} from './handleAPI.js'

const options = {  year: 'numeric', month: 'long', day: 'numeric'}
const month_abrv = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function cardTemplate(location, date, countdown, weather_arr, img){
  console.log(img)
  let weather_items = '';
  weather_arr.forEach((item, i) => {
    let init_date = new Date(date);
    let next_date = new Date(init_date.setDate(init_date.getDate()+i))
    weather_items = weather_items +
    `<div class="trips-card-weather-item">
      <h5 class="trips-card-weather-item-temp">${item.max}&deg;F / ${item.min}&deg;F</br>${month_abrv[next_date.getMonth()]} ${next_date.getDate()}</h5>
    </div>`
  });


  return `<div class="trips-card">
            <img src="${img}" alt="" class="trips-card-photo">
            <div class="trips-card-header">
              <h3>${location}</h3>
              <h4>Departing: ${date}</h4>
            </div>
            <div class="trips-card-countdown">
              <h3>${location} is only ${countdown} days away!</h3>
            </div>
            <div class="trips-card-weather">
              <h5 class="trips-card-weather-header">Typical Weather for then is:</h5>
              ${weather_items}
            </div>
            <div class="trips-card-buttons">
              <button type="button" name="add-lodging">+ add Lodging Info</button>
              <button type="button" name="add-packing">+ add packing list</button>
              <button type="button" name="add-notes">+ add notes</button>
            </div>
        </div>`
}


function newTripOverlay(event){
  event.stopPropagation()
  event.preventDefault()


  let now = new Date();
  document.querySelector('input[type="date"]').setAttribute('min', `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + 1}`);
  document.getElementById('new_trip_overlay').classList.add('flex');
  if(document.getElementById('new_trip_overlay').classList.contains('flex')){

    window.addEventListener('click', function(e){
      if(!document.querySelector('.new_trip_overlay_input').contains(e.target)){
        document.getElementById('new_trip_overlay').classList.remove('flex');
      }
    })
  }
}


function addTrip(event){
  event.preventDefault()

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
      .then(res => queryWeatherbit(data.geonames[0].lng, data.geonames[0].lat, res.application_key))
    })
    .then(weather_data => {
      return getApiKey('pixabayKey')
      .then(res => queryPixabay(res.application_key, location))
      .then(res => {
        document.getElementsByClassName('trips')[0].insertAdjacentHTML('beforeend', cardTemplate(location, date, countdown, weather_data, res.hits[0].webformatURL));
        document.getElementById('new_trip_overlay').classList.remove('flex');
      })
    })
    .catch((error) => {
      console.log(error);
      //errorMsg(error);
    })
  }
}


export {newTripOverlay, addTrip}
