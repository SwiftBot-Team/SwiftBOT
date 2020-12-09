const parser = new (require('rss-parser'));

const { get } = require('lodash');
const twitch = require('../services/Twitch');

const Twitch = new twitch();

module.exports = class {
  constructor(client) {
    this.client = client;
  }


  async run(ready) {

    this.client.music.init(this.client.user.id);

    this.loadYoutubeVideos();

    this.loadStreams();

    this.client.twitch = Twitch;

    this.loadMutes();
  }


  async loadMutes() {
    const ref = await this.client.database.ref(`SwiftBOT/mutados/`).once('value');

    if (!ref.val()) return;

    Object.values(ref.val()).map(guildMutes => {
      Object.values(guildMutes).map(async mute => {
        if (Date.now() > mute.time) {
          const guild = this.client.guilds.cache.get(mute.guild);
          const user = guild.members.cache.get(mute.user);
          const role = guild.roles.cache.get(mute.role);

          if (!guild || !role || !user || !guild.me.permissions.has('MANAGE_ROLES')) return;

          const refTwo = await this.client.database.ref(`SwiftBOT/mutados/${guild.id}/${user.id}`).once('value');

          if (!refTwo.val() || Date.now() < refTwo.val().time) return;

          user.roles.remove(role.id, 'Usuário desmutado automaticamente').catch();

          this.client.database.ref(`SwiftBOT/mutados/${guild.id}/${user.id}`).remove()

        } else {
          setTimeout(async () => {
            const guild = this.client.guilds.cache.get(mute.guild);
            const user = guild.members.cache.get(mute.user);
            const role = guild.roles.cache.get(mute.role);

            if (!guild || !role || !user || !guild.me.permissions.has('MANAGE_ROLES')) return;

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

    const db = await this.client.database.ref(`SwiftBOT/twitchnotification`).once('value');

    this.client.streamers = [];

    if (db.val()) {
      for (const [key, value] of Object.entries(db.val())) this.client.streamers.push(...value);
    };

    if (!this.client.streamers.length) return;


    const array = this.client.streamers;

    const getStreams = async () => {
      array.map(async streamer => {

        const verifyUser = await Twitch.validateUser(streamer.id);

        if (!verifyUser.data.length) return;

        const verify = await Twitch.getStreams(streamer.id);


        const searchArray = array.find(u => u.id === streamer.id && u.guild === streamer.guild);

        if (!verify.data.length && searchArray.status) {
          array[array.indexOf(searchArray)].status = false;
          this.client.database.ref(`SwiftBOT/twitchnotification/${streamer.guild}/${streamer.position}`)
            .update({
              status: false
            });
        }
        else if (verify.data.length && !searchArray.status) {
          array[array.indexOf(searchArray)].status = true;

          this.client.database.ref(`SwiftBOT/twitchnotification/${streamer.guild}/${streamer.position}`)
            .update({
              status: true
            });

          this.client.channels.cache.get(streamer.textChannel)
            .send(`**${streamer.id}** Está ao-vivo na Twitch! Corre lá! \n\nhttps://twitch.tv/${streamer.id}`)
        }
      })
    }

    getStreams();

    setTimeout(() => getStreams(), 120000)
  }


  async loadYoutubeVideos() {
    const db = await this.client.database.ref(`SwiftBOT/youtubenotification`).once('value');

    const array = [];

    if (db.val()) {
      for (const [key, value] of Object.entries(db.val())) array.push(...value);
    }

    this.client.youtubeChannels = array;

    this.client.existingVideos = new Map();

    const verifyNewVideos = async () => {


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

            existingVideos.splice(existingVideos.indexOf(existingVideos.find(e => e.link === v.link)), 1);
          })

          newVideos.map(async v => {
            const send = await this.client.channels.cache.get(c.textChannel)
              .send(`Galera, acabou de sair um vídeo novinho no canal do **${v.author}**! \n\n${v.link}`).catch(err => { return });

            existingVideos.push({ link: v.link, messageID: send.id })
          })
        }, 500 * i)
      })
    }

    verifyNewVideos();

    setInterval(() => verifyNewVideos(), 30000)
  }
}