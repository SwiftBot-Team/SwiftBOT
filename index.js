require('dotenv/config')

const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const SwiftInstance = require('./src/Swift');
const GeralInstance = require('./src/Instance');

const instance = new GeralInstance()

const client = new SwiftInstance(instance, { config: './config.json', fetchAllMembers: true })
client.login().then(() => {
  client.log('Logado com Sucesso!', { color: 'green', tags: ['Discord Client'] })

  client.loadCommands(client.config.paths.commands)
  client.loadEvents(client.config.paths.events)
  client.loadMongo();
  client.loadFirebase();
  client.initListeners();
  client.connectLavalink();
}).catch((err) => { console.log(err); client.log('Ocorreu um erro ao tentar logar! \n\n' + err, { color: 'red', tags: ['Discord Client'] }) })


client.on('ready', () => {
  client.initLoaders();
})

module.exports = client