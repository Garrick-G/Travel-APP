import removeTrip from "../src/client/js/app.js"


test('remove the card', () => {
  document.body.innerHTML =
  '<div class="trip-card">'+
  '    <h1>Test Trip</h1>'+
  '</div>';
  function callback(element){
    window.confirm = jest.fn(()=>true)

    expect(window.confirm).toBeCalled()
  }
})
