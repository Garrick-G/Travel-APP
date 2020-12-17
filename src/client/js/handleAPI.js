const geonames = 'http://api.geonames.org/search?q='
const weatherbit = 'https://api.weatherbit.io/v2.0/history/daily?'
const pixabay = 'https://pixabay.com/api/?key='

export function getApiKey(api){

  return fetch('http://localhost:8084/'+api)
  .then((res) => {
    if(!res.ok){
      if(res.status === 404){
        throw new Error('Unable To Find Application Server!');
      }
      else throw new Error(error);
    }
    return res.json();
  })
}

export function queryGeonames(key, location){
  return fetch(geonames+encodeURIComponent(location)+'&isNameRequired=true&type=json&username='+key)
  .then(res => {
    if(res.ok){
      return res.json();
    }
  })
}

export function queryPixabay(key, location){
  return fetch('http://localhost:8084/pixabayKey')
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
    .catch((error) => {
      console.log(error);
      //errorMsg(error);
    })
  )
}

export function queryWeatherbit(lon, lat, key){
  
  const options = {  year: 'numeric', month: 'long', day: 'numeric'}
  let departure = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''))
  let today = new Date()
  let time_between = departure - today;
  let location = document.getElementById('trip_location_city').value
  let countdown = Math.floor(time_between / (1000 * 60 * 60 * 24))
  let date = new Intl.DateTimeFormat('en-US', options).format(new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, '')));

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
  return new Promise(function(resolve, reject){
    for(let i = 0; i <= 6; i++){
      fetch(`${weatherbit}lat=${lat}&lon=${lon}&start_date=${date_arr[i]}&end_date=${date_arr[i+1]}&units=I&key=${key}`)
      .then(res => {
        if(res.ok){
          return res.json();
        }
      })
      .then(data => {
        weather_arr.push({date: date_arr[i], min: data.data[0].min_temp, max: data.data[0].max_temp, clouds: data.data[0].clouds, rain: data.data[0].precip})
        return new Promise(function(resolve, reject){
          if(weather_arr.length === 7){
            resolve(weather_arr)
          }
        })
    })
    .then(arr => {
      resolve(arr)
    })
    }
  })

}
