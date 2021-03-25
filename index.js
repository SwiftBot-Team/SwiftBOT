require('dotenv/config')

const SwiftInstance = require('./src/Swift');
const GeralInstance = require('./src/Instance');

const instance = new GeralInstance()

const client = new SwiftInstance(instance, {
  config: './config.json',
  fetchAllMembers: true,
  ws:
  {
    intents: ['GUILDS', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES']
  }
});

client.login().then(() => {
  client.log('Logado com Sucesso!', { color: 'green', tags: ['Discord Client'] })

  client.connectLavalink();

  client.loadCommands(client.config.paths.commands)
  client.loadEvents(client.config.paths.events)
  client.loadMongo();
  client.loadFirebase();
  client.initListeners();
}).catch((err) => { console.log(err); client.log('Ocorreu um erro ao tentar logar! \n\n' + err, { color: 'red', tags: ['Discord Client'] }) })


client.on('ready', () => {

  client.initLoaders();

  const { SwiftGiveaways } = require('./src/services/index.js');

  // Starts updating currents giveaways
  client.controllers.sorteios = new SwiftGiveaways(client, {
    storage: false,
    updateCountdownEvery: 10000,
    default: {
      botsCanWin: false,
      exemptPermissions: ["MANAGE_MESSAGES", "ADMINISTRATOR"],
      reaction: "🎉",
      embedColor: "#D90000",
      embedColorEnd: "#D90000"
    }
  });
})

client.on('error', async err => console.log(err));

client.on('err', async err => console.log(err));

module.exports = client;
