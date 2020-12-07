function newTripOverlay(){
  document.getElementById('new_trip_overlay').classList.add('block');
}
function addTrip(event){
  event.preventDefault()
  let location = document.getElementById('trip_location').value
  let date = document.getElementById('trip_date').value
  console.log(location)
  console.log(date)
}
export {newTripOverlay, addTrip}
