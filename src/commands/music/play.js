const Base = require("../../services/Command");

module.exports = class Play extends Base {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'tocar'],
      category: "categories:music",
      description: "descriptions:play",
      cooldown: 5000,
      requiresChannel: true,
      options: [{
        name: 'music',
        description: 'Music to be played',
        type: 3,
        required: true
      }]
    })
  }

  async run({ message, args, player, member }, t) {

    if (!this.client.music.nodes.filter(node => node.connected === true).size)
      return message.respond(t('commands:play.noNodes', { member: message.author.id }));

    if (['CONNECT', 'SPEAK', 'VIEW_CHANNEL'].some(p => !message.member.voice.channel.permissionsFor(this.client.user.id).toArray().includes(p))) {
      const filter = ['CONNECT', 'SPEAK', 'VIEW_CHANNEL'].filter(p => !message.member.voice.channel.permissionsFor(this.client.user).has(p));

      return message.respond(t('commands:play.noPerms', { member, perms: filter.join(" | ") }));
    }

    if (this.client.tts.get(message.guild.id)) return message.respond(t('commands:play.isTTS', { member }))

    if (!args[0] && !message.attachments.first() && message.attachments.first()?.url?.endsWith('.mp4')) return message.respond(t('commands:play.noArgs', { member: message.author.id }));

    if (!player) {

      if (message.guild.me.voice.channel) message.guild.me.voice.channel.leave();

      player = await this.client.music.create({
        guild: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
        selfDeafen: false,
        state: 'DISCONNECTED'
      });
    }

    const toSearch = args[0] ? args.join(" ") : message.attachments.first().url

    player.filters = player.filters || []

    player.lastIndex = 0;

    if (player.state === 'DISCONNECTED') player.connect();

    let amount = 0;

    const tracks = await this.client.music.search(toSearch, message.author);

    if (tracks.error) return message.respond(t('commands:play.fail'));

    if (!tracks.tracks[0]) return message.respond(t('commands:play.noMusicFound'))

    if (tracks.loadType === 'PLAYLIST_LOADED') {

      tracks.tracks.map(async track => {
        amount++;

        player.queue.add(track);

        if (!player.queue.size) player.play();

      });
      message.respond(t('commands:play.added', { amount: tracks.tracks.length }))
    } else {

      if (!args[0] && message.attachments.first()) {
        tracks.tracks[0].title = message.attachments.first().name || 'Sem título'
        tracks.tracks[0].author = message.member.displayName;
      }

      amount++

      player.queue.add(tracks.tracks[0]);

      if (!player.queue.size) player.play();

      return message.respond(t('commands:play.musicLoaded', { name: tracks.tracks[0].title }))
    }
  }
}
