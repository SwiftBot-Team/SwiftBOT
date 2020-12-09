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

  async run({ message, args, player }, t) {

    if (!this.client.music.nodes.filter(node => node.connected === true).size)
      return this.respond(t('commands:play.noNodes', { member: message.author.id }))

    if (!args[0]) return this.respond(t('commands:play.noArgs', { member: message.author.id }));

    player = player || await this.client.music.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: true
    });


    if (player.state === 'DISCONNECTED') player.connect();

    let amount = 0;

    const tracks = await this.client.music.search(args.slice(0).join(" "), message.author);


    if (tracks.error) return this.respond(t('commands:play.fail'));

    if (!tracks.tracks[0]) return this.respond(t('commands:play.noMusicFound'))

    if (tracks.loadType === 'PLAYLIST_LOADED') {

      tracks.tracks.map(async track => {
        amount++;

        player.queue.add(track);

        if (!player.queue.size) player.play();

      });

    } else {

      amount++

      player.queue.add(tracks.tracks[0]);

      if (!player.queue.size) player.play();
    }

    await message.react('👍');
  }
}