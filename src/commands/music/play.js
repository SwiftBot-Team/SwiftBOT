const Base = require("../../services/Command");

module.exports = class Play extends Base {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'tocar'],
      category: "categories:music",
    })
  }

  async run({ message, args }, t) {

    if (!args[0]) return this.respond(t('comandos:play:noArgs', { member: message.author.id }));

    const player = await this.client.music.join({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel
    });

    const music = await player.getType(args.join(' '));
    if (!music.data.length) return this.respond(t('commands:play.noMusicFound'));

    let amount = 0;

    let wait;

    for (let i = 0; i < music.data.length; i++) {

      const tracks = await this.client.music.fetchTracks(music.data[i]);

      if (tracks.error) return this.respond(t('commands:play.fail'));

      if (tracks.loadType === 'PLAYLIST_LOADED') {

        tracks.map(async track => {
          amount++;
          player.queue.add(track);
          player.queue[player.queue.length - 1].info.autorID = message.author.id;
          if (!player.playing) await player.play();

          if (player.queue.length >= 1 && !wait && music.data.length >= 5) wait = await this.respond(t('commands:play.adding', { amount: amount }));

          if (player.queue.length >= 1 && wait && music.data.length >= 5) wait = await wait.edit(new this.client.embed().setDescription(t('commands:play.adding', { amount: amount })));

        });

      } else {
        if (!tracks.tracks[0]) continue;
        amount++
        tracks.tracks[0].info.autorID = message.author.id;
        player.queue.add(tracks.tracks[0]);

        if (!player.playing && !amount > 1) await player.play();

        if (player.queue.length >= 1 && !wait && music.data.length >= 5) wait = await this.respond(t('commands:play.adding', { amount: amount }));

        if (player.queue.length >= 1 && wait && music.data.length >= 5) wait = await wait.edit(new this.client.embed().setDescription(t('commands:play.adding', { amount: amount })));
      }
    }

    await message.react('👍');

    if (player.playing) wait ? wait.edit(new this.client.embed().setDescription(t('commands:play.added', { amount: amount }))) : this.respond(amount > 1 ? t('commands:play.playlistLoaded', { amount: amount }) : t('commands:play.musicLoaded', { name: player.queue[player.queue.length - 1].info.title }));

    if (!player.playing) return player.play();

  }
}