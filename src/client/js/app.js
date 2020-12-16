const geonames = 'http://api.geonames.org/search?q='
const weatherbit = 'https://api.weatherbit.io/v2.0/history/daily?'
const pixabay = 'https://pixabay.com/api/?key='
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

function queryGeonames(key, location){
  fetch(geonames+encodeURIComponent(location)+'&isNameRequired=true&type=json&username='+key)
  .then(res => {
    if(res.ok){
      return res.json();
    }
  })
  .then(data => {
    fetch('http://localhost:8084/weatherbitKey')
    .then((res) => {
      if(!res.ok){
        if(res.status === 404){
          throw new Error('Unable To Find Application Server!');
        }
        else throw new Error(error);
      }
      return res.json();
    })
    .then(res => {
      queryWeatherbit(data.geonames[0].lng, data.geonames[0].lat, res.application_key)
    })
    .catch((error) => {
      console.log(error);
      //errorMsg(error);
    })
  })
}

function queryWeatherbit(lon, lat, key){
  //To Be Sent To cardTemplate()
  let departure = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''))
  let today = new Date()
  let time_between = departure - today;
  let location = document.getElementById('trip_location_city').value
  let countdown = Math.floor(time_between / (1000 * 60 * 60 * 24))
  let date = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, '')));
  //*********************************************************************************************************************************************************************

  let end_date;
  let now = new Date()
  let end;
  let date_arr = []

  //If the current month is after the month of trip
  if((now.getMonth()) > departure.getMonth()){
    //push the start date of trip, substituting current year for most recent data
    date_arr.push(`${now.getFullYear()}-${departure.getMonth() + 1}-${departure.getDate()}`)
    for(let i = 1; i < 8; i++){
      let temp = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''))
      end_date = new Date(temp.setDate(temp.getDate()+i))
      end = `${now.getFullYear()}-${end_date.getMonth() + 1}-${end_date.getDate()}`;
      date_arr.push(end);
    }
  }
  else{
    date_arr.push(`${now.getFullYear()-1}-${departure.getMonth() + 1}-${departure.getDate()}`)
    for(let i = 1; i < 8; i++){
      end_date = new Date(temp.setDate(temp.getDate()+i))
      end = `${now.getFullYear()-1}-${end_date.getMonth() + 1}-${end_date.getDate()}`;
      date_arr.push(end);
    }
  }
  let weather_arr = []
  for(let i = 0; i <= 6; i++){
    fetch(`${weatherbit}lat=${lat}&lon=${lon}&start_date=${date_arr[i]}&end_date=${date_arr[i+1]}&units=I&key=${key}`)
    .then(res => {
      if(res.ok){
        return res.json();
      }
    })
    .then(data => {
      weather_arr.push({date: date_arr[i], min: data.data[0].min_temp, max: data.data[0].max_temp, clouds: data.data[0].clouds, rain: data.data[0].precip})
      if(weather_arr.length == 7){
        fetch('http://localhost:8084/pixabayKey')
        .then((res) => {
          if(!res.ok){
            if(res.status === 404){
              throw new Error('Unable To Find Application Server!');
            }
            else throw new Error(error);
          }
          return res.json();
        })
        .then(res =>
          fetch(pixabay+res.application_key+'&q='+encodeURIComponent(location)+'&image_type=photo')
          .then(data => {
            if(data.ok){
              return data.json();
            }
          })
          .then(imgs => {
            document.getElementsByClassName('trips')[0].insertAdjacentHTML('beforeend', cardTemplate(location, date, countdown, weather_arr, imgs.hits[0].webformatURL));
            document.getElementById('new_trip_overlay').classList.remove('flex');
          })
        .catch((error) => {
          console.log(error);
          //errorMsg(error);
        })
      )
    }
  })
  }
}
  //Fetch historical data for each day of the week (Because of trial version restrictions)


function addTrip(event){
  event.preventDefault()

  let location = document.getElementById('trip_location_city').value

  //let date = document.getElementById('trip_date').value
  let departure = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''))
  let date = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, '')));
  if(location && date){

    fetch('http://localhost:8084/geonamesKey')
    .then((res) => {
      if(!res.ok){
        if(res.status === 404){
          throw new Error('Unable To Find Application Server!');
        }
        else throw new Error(error);
      }
      return res.json();
    })
    .then(res => queryGeonames(res.application_key, location))
    .catch((error) => {
      console.log(error);
      //errorMsg(error);
    })
  }
}
export {newTripOverlay, addTrip}
