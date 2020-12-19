const express = require('express');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

/* Middleware*/
// Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

const apiKeys = {
  geonames: process.env.GEONAMES_KEY,
  weatherbit: process.env.WEATHERBIT_KEY,
  pixabay: process.env.PIXABAY_KEY,
};

app.use(express.static('dist'));

console.log(__dirname);

app.get('/', function(req, res) {
  res.sendFile('./dist/index.html');
  // res.sendFile(path.resolve('src/client/html/index.html'))
});

// designates what port the app will listen to for incoming requests
const server = app.listen(8084, function() {
  console.log('Example app listening on port 8084!');
});

app.get('/apiKeys', function(req, res) {
  res.send(apiKeys);
});

module.exports = {server}
