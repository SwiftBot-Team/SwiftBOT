require('dotenv/config');

const SwiftInstance = require('./src/Swift');

const GeralInstance = require('./src/Instance');

const instance = new GeralInstance();

const axios = require('axios')

const { Intents, Collection, Message } = require('discord.js');

const client = new SwiftInstance(instance, {
  config: './config.json',
  fetchAllMembers: true,
  ws:
  {
    intents: Intents.ALL
  },
  allowedMentions: {
    parse: ['everyone']
  }
});

require('discord-buttons')(client);

client.buttons = require('discord-buttons');

require('./prototype.js');

client.login(process.env.TOKEN)
  .then(() => {
    client.log('Logado com Sucesso!', { color: 'green', tags: ['Discord Client'] })

    client.connectLavalink();

    client.loadCommands(client.config.paths.commands)
    client.loadEvents(client.config.paths.events)
    client.loadMongo();
    client.loadFirebase();
    client.initListeners();

    client.loadEmpresas()
  }).catch((err) => { console.log(err); client.log('Ocorreu um erro ao tentar logar! \n\n' + err, { color: 'red', tags: ['Discord Client'] }) })


client.on('ready', () => {

  console.log('Estou online!');
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

client.on('error', async err => {
  client.channels.cache.get('833718796812419092').send(`Ops! <@&831987615166103633>, ocorreu um erro. Por favor, verifique o console. Mensagem do erro: ${err.message}`);

  console.log(err)
});

process.on('unhandledRejection', async (err) => {
  // client.channels.cache.get('833718796812419092').send(`Ops! <@&831987615166103633>, ocorreu um erro. Por favor, verifique o console. Mensagem do erro: ${err.message}`);

  console.log(err)
});

async function killProcess() {
  process.exit()
}

//  process.on('SIGTERM', async () => {
//    await axios({
//      method: 'post',
//      url: process.env.BACKEND_URL,
//      headers: {}, 
//     data: {
//        status: 'Algo inesperado aconteceu, oque causou a queda do SwiftBOT.'
//      }
//    });

//    killProcess()
//  });

//  process.on('SIGINT', async () => {
//    await axios({
//      method: 'post',
//      url: process.env.BACKEND_URL,
//      headers: {}, 
//      data: {
//        status: 'O SwiftBOT foi desligado por alguém.'
//      }
//    });

//    killProcess()
//  });

//  process.on('uncaughtException', async function(e) {

//      await axios({
//        method: 'post',
//        url: process.env.BACKEND_URL,
//        headers: {}, 
//        data: {
//          status: 'Um erro ocorreu no SwiftBOT, oque causou a queda dele. Aguarde que ele volte.'
//        }
//      });

//      killProcess();
//  });

client.ws.on('INTERACTION_CREATE', async data => {

  if (data.type === 3) return;

  const { MessageComponent } = client.buttons;

  const { MessageComponentTypes } = client.buttons.Constants;



  client.api.interactions(data.id, data.token).callback.post({ data: { type: 5 } });

  const guild = client.guilds.cache.get(data.guild_id);
  const channel = guild.channels.cache.get(data.channel_id);

  const mentions = {
    mention_roles: data.data.resolved ? data.data.resolved.roles ? new Collection(Object.entries(data.data.resolved.roles)) : new Collection() : new Collection(),
    mention_members: data.data.resolved ? data.data.resolved.members ? new Collection(Object.entries(data.data.resolved.members)) : new Collection() : new Collection(),
    mention_users: data.data.resolved ? data.data.resolved.users ? new Collection(Object.entries(data.data.resolved.users)) : new Collection() : new Collection(),
    mention_channels: data.data.resolved ? data.data.resolved.channels ? new Collection(Object.entries(data.data.resolved.channels).map(([key, value]) => [key, client.channels.cache.get(key)])) : new Collection() : new Collection()
  };

  let content = data.data.name + ' ' + data.data.options?.map(o => {
    return guild.members.cache.get(o.value) || guild.roles.cache.get(o.value) || guild.channels.cache.get(o.value)?.toString() || o.value
  }).join(" ") || '';

  const member = guild.members.cache.get(data.member.user.id) || await guild.members.fetch(data.member.user.id);

  const message = await new Message(client, {
    guild,
    channel,
    client,
    id: data.id,
    deleted: true,
    content,
    mentions: mentions.mention_members,
    ...mentions,
    author: data.member.user,
    member: {
      ...member,
      _roles: member.roles.cache.array().map(r => r.id)
    }
  }, channel);

  for (const [key] of message.mentions.users) {
    message.mentions.members.set(key, message.guild.members.cache.get(key) || await message.guild.members.fetch(key))
  };

  const command = client.commands.find(c => c.help.name === data.data.name) || client.commands.find(c => c.help.aliases.map(a => a.toLowerCase()).includes(data.data.name));

  const args = [...data.data.options?.map(e => {

    if (e.options && e.options.length) return [e.name, ...e.options.map(o => o.value)];

    const to = e.value || e.name

    return isNaN(to) ? to : String(to);

  }) || [].reduce((a, b) => a.concat(b), [])].reduce((a, b) => a.concat(b), []);

  message.interaction = data;

  const t = await client.getTranslate(message.guild.id);

  const player = client.music.players.get(message.guild.id);

  const games = client.games;

  const language = await client.getLanguage(message.guild.id);

  const tts = client.tts.get(message.guild.id)

  command.setMessage(message, args);

  const verify = await command.verifyRequirementes(t);

  if (verify) return;

  if (command.cooldown.get(message.author.id)) return message.quote(Embed.setDescription(t('errors:cooldownError', { cooldown: Math.floor((cmd.cooldown.get(message.author.id) - Date.now()) / 1000) > 1 ? Math.floor((cmd.cooldown.get(message.author.id) - Date.now()) / 1000) : 'alguns' })))

  command.run({ message, args, language, games, player, tts, member: message.author.id, prefix: '/' }, t);

  command.startCooldown(message);

});

module.exports = client
