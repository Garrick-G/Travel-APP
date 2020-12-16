var path = require('path')
const express = require('express')
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();

const app = express()

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

var geonamesApi = {
  application_key: process.env.GEONAMES_KEY
};
var weatherbitApi = {
  application_key: process.env.WEATHERBIT_KEY
};
var pixabayApi = {
  application_key: process.env.PIXABAY_KEY
};

app.use(express.static('dist'))

console.log(__dirname)

app.get('/', function (req, res) {
    res.sendFile('./dist/index.html')
    //res.sendFile(path.resolve('src/client/html/index.html'))
})

// designates what port the app will listen to for incoming requests
app.listen(8084, function () {
    console.log('Example app listening on port 8084!')
})

app.get('/geonamesKey', function (req, res) {
    res.send(geonamesApi)
})
app.get('/weatherbitKey', function (req, res) {
    res.send(weatherbitApi)
})
app.get('/pixabayKey', function (req, res) {
    res.send(pixabayApi)
})
