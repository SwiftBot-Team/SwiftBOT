require('dotenv/config');

const SwiftInstance = require('./src/Swift');
const GeralInstance = require('./src/Instance');

const Guild = require('./src/database/models/Guild')

const instance = new GeralInstance()

const fs = require('fs')
const path = require('path')

const i18next = require('i18next')
const translationBackend = require('i18next-node-fs-backend')

const { GorilinkManager } = require('gorilink');

const { SwiftMusic } = require("./src/services/Music");

const nodes = [
  {
    tag: 'Node 1',
    host: process.env.LAVALINK_HOST,
    port: process.env.LAVALINK_PORT,
    password: process.env.LAVALINK_PASSWORD,
  }
]

const client = new SwiftInstance(instance, { config: './config.json' })
client.login().then(() => {
  client.log('Logado com Sucesso!', { color: 'green', tags: ['Discord Client'] })

  client.loadCommands(client.config.paths.commands)
  client.loadEvents(client.config.paths.events)
  client.loadMongo();
  client.loadFirebase();
}).catch((err) => { console.log(err); client.log('Ocorreu um erro ao tentar logar! \n\n' + err, { color: 'red', tags: ['Discord Client'] }) })


client.on('ready', () => {
  client.initLoaders();
})
