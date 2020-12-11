function cardTemplate(location, date){
  return `<div class="trips-card">
            <div class="trips-card-header">
              <h3>${location}</h3>
              <h4>Departing: ${date}</h4>
            </div>
            <div class="trips-card-countdown">
              <h3>Honduras is only 200 days away!</h3>
            </div>
            <div class="trips-card-weather">
              <h5>Typical Weather for then is:</h5>
              <p>High: 86, Low: 68</p>
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
  let location = document.getElementById('trip_location').value
  let date = document.getElementById('trip_date').value
  if(location && date){
    document.getElementsByClassName('trips')[0].insertAdjacentHTML('beforeend', cardTemplate(location, date));
    document.getElementById('new_trip_overlay').classList.remove('flex');
  }
}
export {newTripOverlay, addTrip}
