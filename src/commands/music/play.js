const Base = require("../../services/Command");

module.exports = class Play extends Base {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'tocar'],
    })
  }

  async run({ message, args }, t) {

    if (!message.member.voice.channel) return this.respond(t('comandos:play:canal', { member: message.author.id }));
    if (message.guild.me.voice.channel && message.guild.me.voice.channel !== message.member.voice.channel) return this.respond(t('commands:play.isPlaying', { member: message.author.id }));
    if (!args[0]) return this.respond(t('comandos:play:noArgs', { member: message.author.id }));

    const player = await this.client.music.join({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel
    });

    const music = await player.getType(args.join(' '));
    if (!music.data.length) return this.respond(t('commands:play.noMusicFound'));

    let amount = 0;

    for (let i = 0; i < music.data.length; i++) {

      const tracks = await this.client.music.fetchTracks(music.data[i]);

      if (tracks.loadType === 'PLAYLIST_LOADED') {

        tracks.map(track => {
          amount++;
          player.queue.add(track);
          player.queue[player.queue.length - 1].info.autorID = message.author.id;
          if (!player.playing) player.play();
        });

      } else {
        if (!tracks.tracks[0]) continue;
        amount++
        tracks.tracks[0].info.autorID = message.author.id;
        player.queue.add(tracks.tracks[0]);

        if (!player.playing && !amount > 1) player.play();
      }
    }

    if (player.playing) this.respond(amount > 1 ? t('commands:play.playlistLoaded', { amount: amount }) : t('commands:play.musicLoaded', { name: player.queue[player.queue.length - 1].info.title }));

    if (!player.playing) return player.play();

  }
}