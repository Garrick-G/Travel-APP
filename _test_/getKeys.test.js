import "core-js/stable";
import "regenerator-runtime/runtime";
const server = require("../src/server/server.js")

const request = require('supertest')

test('Gets the API keys', async done => {
  request(server)
    .get('/apiKeys')
    .expect(200,done)
})
