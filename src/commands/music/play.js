const Base = require("../../services/Command");

module.exports = class Play extends Base {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'tocar'],
      category: "categories:music",
      cooldown: 5000,
      requiresChannel: true
    })
  }

  async run({ message, args }, t) {

    if (!this.client.music.nodes.filter(node => node.connected === true))
      return this.respond(t('commands:play.noNodes', { member: message.author.id }))

    if (!args[0]) return this.respond(t('commands:play.noArgs', { member: message.author.id }));

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

      if (tracks.error) continue;

      if (tracks.loadType === 'PLAYLIST_LOADED') {

        tracks.tracks.map(async track => {
          amount++;
          player.queue.add(track);
          player.queue[player.queue.length - 1].info.autorID = message.author.id;

          if (!player.playing) player.play();

          if (player.queue.length >= 1 && !wait && music.data.length >= 5) wait = await this.respond(t('commands:play.adding', { amount: amount }));

          if (player.queue.length >= 1 && wait && music.data.length >= 5) wait = await wait.edit(new this.client.embed().setDescription(t('commands:play.adding', { amount: amount })));

        });

      } else {
        if (!tracks.tracks[0]) continue;

        if (player.queue.length > 0 && music.data.length === 1) {
          this.respond(t('commands:play.musicLoaded', { name: tracks.tracks[0].info.title }));
        }

        amount++
        tracks.tracks[0].info.autorID = message.author.id;
        player.queue.add(tracks.tracks[0]);

        if (!player.playing) player.play();

        if (player.queue.length >= 1 && !wait && music.data.length >= 5) wait = await this.respond(t('commands:play.adding', { amount: amount }));

        if (player.queue.length >= 1 && wait && music.data.length >= 5) wait = await wait.edit(new this.client.embed().setDescription(t('commands:play.adding', { amount: amount })));
      }
    }

    if (amount === 0) {
      return this.respond('Não encontrei esta música.')
    }

    await message.react('👍');

    if (player.playing && wait) wait.edit(new this.client.embed().setDescription(t('commands:play.added', { amount: amount })));

    if (!player.playing) return player.play();

  }
}