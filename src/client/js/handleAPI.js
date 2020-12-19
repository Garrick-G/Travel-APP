const geonames = 'http://api.geonames.org/search?q=';
const weatherbit = 'https://api.weatherbit.io/v2.0/history/daily?';
const pixabay = 'https://pixabay.com/api/?key=';


export const getApiKeys = () =>{
  return fetch('http://localhost:8084/apiKeys')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Unable To Find Application Server!');
          }
        } else {
          return res.json();
        }
      });
}

export const getTripData =() =>{
  return fetch('http://localhost:8084/trip')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Unable To Find Application Server!');
          }
        } else {
          return res.json();
        }
      });
}


export const postToServer = (data = {}) =>{
  return fetch('http://localhost:8084/trip', {
    method: 'POST',
    credentials: 'same-origin',
    headers:{
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then((res) => {
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Unable To Find Application Server!');
      }
    } else {
          return res.json();
        }
  });
}

export const queryGeonames = (key, location) => {
  return fetch(geonames+encodeURIComponent(location)+'&isNameRequired=true&type=json&username='+key)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      });
}

export const queryPixabay = (key, location, country = null) =>{
  return fetch(pixabay+key+'&q='+encodeURIComponent(location)+'&image_type=photo')
      .then((data) => {
        if (data.ok) {
          return data.json();
        }
      })
      .then((data) => {
        if (data.total === 0) {
          return queryPixabay(key, country);
        }
        return data;
      })
      .catch((error) => {
        console.log(error);
      // errorMsg(error);
      });
}

export const queryWeatherbit = (lon, lat, country, key) => {
  const departure = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''));

  let end_date;
  const now = new Date();
  let end;
  const date_arr = [];

  // If the current month is after the month of trip
  if ((now.getMonth()) > departure.getMonth()) {
    // push the start date of trip, substituting current year for most recent data
    date_arr.push(`${now.getFullYear()}-${departure.getMonth() + 1}-${departure.getDate()}`);
    for (let i = 1; i < 8; i++) {
      const temp = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''));
      end_date = new Date(temp.setDate(temp.getDate()+i));
      end = `${now.getFullYear()}-${end_date.getMonth() + 1}-${end_date.getDate()}`;
      date_arr.push(end);
    }
  } else {
    date_arr.push(`${now.getFullYear()-1}-${departure.getMonth() + 1}-${departure.getDate()}`);
    for (let i = 1; i < 8; i++) {
      const temp = new Date(document.getElementById('trip_date').value.replace(/-/g, '\/').replace(/T.+/, ''));
      end_date = new Date(temp.setDate(temp.getDate()+i));
      end = `${now.getFullYear()-1}-${end_date.getMonth() + 1}-${end_date.getDate()}`;
      date_arr.push(end);
    }
  }
  const weather_arr = [];
  return new Promise((resolve) => {
    for (let i = 0; i <= 6; i++) {
      fetch(`${weatherbit}lat=${lat}&lon=${lon}&start_date=${date_arr[i]}&end_date=${date_arr[i+1]}&units=I&key=${key}`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
          })
          .then((data) => {
            weather_arr.push({date: date_arr[i], min: data.data[0].min_temp, max: data.data[0].max_temp, clouds: data.data[0].clouds, rain: data.data[0].precip});
            return new Promise(function(resolve) {
              if (weather_arr.length === 7) {
                resolve(weather_arr);
              }
            });
          })
          .then((arr) => {
            resolve({weather: arr, country: country});
          });
    }
  });
}
