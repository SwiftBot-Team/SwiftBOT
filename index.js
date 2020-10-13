require('dotenv/config')

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