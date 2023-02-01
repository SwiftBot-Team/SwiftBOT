const parser = new (require('rss-parser'));
const express = require('express')
const http = require('http');
const cron = require('node-cron')
const axios = require('axios')
const cors = require('cors')

const { get } = require('lodash');
const twitch = require('../services/Twitch');

const Twitch = new twitch();

const Locale = require('../../lib');
// const DBL = require('dblapi.js');

const { Collection } = require('discord.js');

module.exports = class {
  constructor(client) {
    this.client = client;
    this.name = 'ready'
  }


  async run(ready) {

    const commands = await this.client.database.ref(`SwiftBOT/usedCommands`).once('value').then(d => d.val() || 0);

    const rasp = await this.client.database.ref(`SwiftBOT/raspadinhas`).once('value').then(d => d.val() || 0);

    this.client.raspNumber = rasp;

    this.client.lastRaspNumber = rasp;

    this.client.usedCommands = commands;

    this.client.lastCommands = commands;

    this.client.dbl = new (require('dblapi.js'))(process.env.DBL_TOKEN);

    setInterval(() => {
      axios.get(process.env.API_URL + 'render&page=https://google.com').then(res => true, (err) => true).catch(err => true)
    }, 30000)

    setInterval(() => {

      if (this.client.raspNumber !== this.client.lastRaspNumber) {
        this.client.lastRaspNumber = this.client.raspNumber;

        this.client.database.ref(`SwiftBOT/raspadinhas`).set(this.client.raspNumber);
      }

      if (this.client.usedCommands === this.client.lastCommands) return;

      this.client.lastCommands = this.client.usedCommands;

      this.client.database.ref(`SwiftBOT/usedCommands`).set(this.client.usedCommands);


    }, 60000 * 5)

    this.client.dbl.postStats(this.client.guilds.cache.size, this.client.shard || 0, this.client.options.shards.length)

    setInterval(() => this.client.dbl.postStats(this.client.guilds.cache.size, this.client.shard || 0, this.client.options.shards.length), 1800000)

    this.client.music.init(this.client.user.id);

    this.loadStreams();
    this.loadYoutubeVideos();

    setInterval(() => {
      this.loadYoutubeVideos();

      this.loadStreams();
    }, 30000)

    this.verifyJail()

    this.client.twitch = Twitch;

    this.loadMutes();
    this.postCommands();
    this.loadLembretes();

    this.loadSlashCommands();
  }

  async loadLembretes() {
    const ref = await this.client.database.ref(`SwiftBOT/lembretes/`).once('value').then(d => d.val());

    if (!ref) return;

    const lembretes = Object.entries(ref).map(l => ({ ...l[1].map(e => ({ ...e, owner: l[0] })) }))


    lembretes.map(async user => {
      for (const lembrete in user) {

        const l = user[lembrete];


        const embed = new this.client.embed()
          .setAuthor('Lembrete!', this.client.user.displayAvatarURL())
          .setDescription(l.name);

        const channel = this.client.channels.cache.get(l.channel);

        if (Date.now() > l.time) {
          channel.send(this.client.users.cache.get(l.owner) || `<@${l.owner}>`, embed);

          const newRef = await this.client.database.ref(`SwiftBOT/lembretes/${l.owner}`).once('value').then(d => d.val());

          newRef.splice(newRef.indexOf(newRef.find(lem => lem.name === l.name)), 1);

          this.client.database.ref(`SwiftBOT/lembretes/${l.owner}`).set(newRef);
        } else {
          setTimeout(async () => {
            channel.send(this.client.users.cache.get(l.owner) || `<@${l.owner}>`, embed);

            const newRef = await this.client.database.ref(`SwiftBOT/lembretes/${l.owner}`).once('value').then(d => d.val());

            newRef.splice(newRef.indexOf(newRef.find(lem => lem.name === l.name)), 1);

            this.client.database.ref(`SwiftBOT/lembretes/${l.owner}`).set(newRef);

          }, l.time - Date.now())
        }
      }
    })
  }

  async verifyJail() {
    cron.schedule('0 17 * * *', async () => {
      this.client.database.ref(`SwiftBOT/Economia`).once('value').then(async db => {

        const obj = db.val();
        for (const i in obj) obj[i].jailed = false;
        return this.client.database.ref(`SwiftBOT/Economia`).set(obj);
      })
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"
    });
  }

  async postCommands() {
    let t = await this.client.getTranslate();

    const categories = this.client.commands.filter(cmd => !cmd.hidden).map(c => c.help.category).filter((v, i, a) => a.indexOf(v) === i);

    const cmds = {};

    await Promise.all(categories
      .sort((a, b) => t(`${a}`).localeCompare(t(`${b}`)))
      .map(async (category) => {
        Promise.all(this.client.commands
          .filter(c => c.help.category === category)
          .sort((a, b) => a.help.name.localeCompare(b.name))
          .map(async (c) => {
            const description = await t(c.help.description);
            return {
              name: c.help.name,
              aliases: c.conf.aliases,
              description: description
            };
          })).then(res => cmds[t(category)] = res)
      })).then(res => res);

    await this.client.database.ref(`SwiftBOT/commands/`).set(cmds)
    console.log(`Comandos postados`)

  }


  async loadMutes() {
    const ref = await this.client.database.ref(`SwiftBOT/mutados/`).once('value');

    if (!ref.val()) return;

    Object.values(ref.val()).map(guildMutes => {
      Object.values(guildMutes).map(async mute => {
        if (Date.now() > mute.time) {
          const guild = this.client.guilds.cache.get(mute.guild);

          if (!guild) return;

          const user = guild.members.cache.get(mute.user) || await guild.members.fetch(mute.user).catch(err => undefined);

          const role = guild.roles.cache.get(mute.role);

          if (!role || !user || !guild.me.permissions.has('MANAGE_ROLES') || !user.manageable) return;

          const refTwo = await this.client.database.ref(`SwiftBOT/mutados/${guild.id}/${user.id}`).once('value');

          if (!refTwo.val() || Date.now() < refTwo.val().time) return;

          user.roles.remove(role.id, 'Usuário desmutado automaticamente').catch();

          this.client.database.ref(`SwiftBOT/mutados/${guild.id}/${user.id}`).remove()

        } else {
          setTimeout(async () => {
            const guild = this.client.guilds.cache.get(mute.guild);

            if (!guild) return;

            const user = guild.members.cache.get(mute.user) || await guild.members.fetch(mute.user).catch(err => undefined);

            const role = guild.roles.cache.get(mute.role);

            if (!role || !user || !guild.me.permissions.has('MANAGE_ROLES') || !user.manageable) return;

            const refTwo = await this.client.database.ref(`SwiftBOT/mutados/${guild.id}/${user.id}`).once('value');

            if (!refTwo.val() || Date.now() < refTwo.val().time) return;

            user.roles.remove(role.id, 'Usuário desmutado automaticamente').catch();

            this.client.database.ref(`SwiftBOT/mutados/${guild.id}/${user.id}`).remove();

          }, mute.time - Date.now() >= 2332800000 ? 2332800000 : mute.time - Date.now());
        }
      })
    })
  }



  async loadStreams() {
    const getStreams = async () => {
      const db = await this.client.database.ref(`SwiftBOT/twitchnotification`).once('value');

      this.client.streamers = new Collection()

      if (db.val()) {
        for (const [key, value] of Object.entries(db.val())) this.client.streamers.set(key, value)
      };

      if (!this.client.streamers.size) return;


      const array = this.client.streamers.map((value, streamer) => ({ value, streamer }))

      array.map(async channel => {

        const verifyUser = await Twitch.validateUser(channel.streamer);

        if (!verifyUser || !verifyUser.data.length) return;

        const verify = await Twitch.getStreams(channel.streamer);

        if (!verify.data.length) {

          channel.value = channel.value.map(v => ({ ...v, status: false }));

          this.client.database.ref(`SwiftBOT/twitchnotification/${channel.streamer}`).set(channel.value);

        } else if (verify.data.length) {
          const guildsToNotify = channel.value.filter(v => v.status === false);


          guildsToNotify.forEach(guild => {
            const textChannel = this.client.channels.cache.get(guild.textChannel);

            if (!textChannel) return;

            textChannel.send(`**${channel.streamer}** Está ao-vivo na Twitch! Corre lá! \n\nhttps://twitch.tv/${channel.streamer}`)
          });

          channel.value = channel.value.map(v => ({ ...v, status: true }));
          
          this.client.database.ref(`SwiftBOT/twitchnotification/${channel.streamer}`).set(channel.value)
        }
      })
    }

    getStreams();
  }


  async loadYoutubeVideos() {
    const verifyNewVideos = async () => {

      const db = await this.client.database.ref(`SwiftBOT/youtubenotification`).once('value');

      const array = [];

      if (db.val()) {
        for (const [key, value] of Object.entries(db.val())) array.push(...value);
      }

      this.client.youtubeChannels = array;

      this.client.existingVideos = new Map();


      this.client.youtubeChannels.map(async (c, i) => {

        setTimeout(async () => {
          const getVideos = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}`).catch(err => { return });

          if (!getVideos || !getVideos.items.length) return;

          if (!this.client.existingVideos.get(c.id)) return this.client.existingVideos.set(c.id, getVideos.items || []);

          const existingVideos = this.client.existingVideos.get(c.id);

          const newVideos = getVideos.items.filter(v => !existingVideos.find(o => o.link === v.link));

          const removeed = existingVideos.filter(v => v.messageID && !getVideos.items.find(g => g.link === v.link));

          removeed.map(async v => {
            const message = await this.client.channels.cache.get(c.textChannel).messages.fetch(v.messageID).catch(err => { return });

            if (message) message.delete({ timeout: 5000 }).catch(err => { retun });

            this.client.existingVideos.get(c.id).splice(existingVideos.indexOf(existingVideos.find(e => e.link === v.link)), 1);
          })

          newVideos.map(async v => {
            const send = await this.client.channels.cache.get(c.textChannel)
              .send(`Galera, acabou de sair um vídeo novinho no canal do **${v.author}**! \n\n${v.link}`).catch(err => { return });

            this.client.existingVideos.get(c.id).push({ link: v.link, messageID: send.id })
          })
        }, 500 * i)
      })
    }

    verifyNewVideos();
  }

  async loadSlashCommands() {

    const exists = await this.client.api.applications(this.client.user.id).commands.get();

    const commandsToAdd = this.client.commands.filter(c => (c.help.options.length && !exists.find(e => e.name === c.help.name)) || (!exists.find(e => e.name === c.help.name) && c.help.slash));

    const commandsToRemove = exists.filter(e => !this.client.commands.find(c => c.help.name === e.name) || !this.client.commands.find(c => c.help.name === e.name).help.options.length && this.client.commands.find(c => c.help.name === e.name).help.slash !== true);

    if (!commandsToAdd.length && !commandsToRemove.length) return this.client.log('Nenhuma modificação para fazer.', { tags: ['Slash Commands'], color: 'green' });

    const l = new Locale('src/languages', {
      returnUndefined: false,
      defaultLanguage: 'pt',
      debug: false
    });

    await l.init();

    l.setLang('en');

    let t = l.t.bind(l);

    for (const command of commandsToAdd) {
      this.client.api.applications(this.client.user.id).commands.post({
        data: {
          ...command.help,
          description: t(command.help.description)
        }
      }).then(() => this.client.log(`Comando ${command.help.name} criado.`, { tags: ['Slash Commands'], color: 'green' }), (err) => {
        this.client.log(`Ocorreu um erro ao criar o comando ${command.help.name}. Erro: ${err.message}`, { tags: ['Slash Commands'], color: 'green' })
      })
    };

    for (const command of commandsToRemove) {
      this.client.api.applications(this.client.user.id).commands(command.id).delete().then(() => this.client.log(`Comando ${command.name} deletado.`, { tags: ['Slash Commands'], color: 'green' }), (err) => {
        this.client.log(`Ocorreu um erro ao deletar o comando ${command.help.name}. Erro: ${err.message}`, { tags: ['Slash Commands'], color: 'green' })
      })
    }
  }
}
