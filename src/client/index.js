import {newTripOverlay, addTrip, removeTrip} from './js/app.js';
import './styles/main.scss';


document.addEventListener('DOMContentLoaded', () => {
  document.getElementsByClassName('new_trip_overlay_input')[0].addEventListener('keypress', function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      if (document.getElementsByClassName('overlay_new_trip')[0].classList.contains('hidden')) {
        document.getElementsByClassName('overlay_new_loc')[0].click();
      } else {
        document.getElementsByClassName('overlay_new_trip')[0].click();
      }
    }
  });
});

export {
  newTripOverlay,
  addTrip,
  removeTrip,
};
