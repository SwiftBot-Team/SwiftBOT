const Base = require("../../services/Command");

const { inspect } = require('util');

class GuildLeave extends Base {
  constructor(client) {
    super(client, {
      name: "guildleave",
      cooldown: 1000,
      category: 'categories:devs',
      aliases: ["gl"],
      hidden: true
    });
  }

  async run({ message, args, prefix, player, games }, t) {
    if (
        !this.client.guilds.cache.get('631467420510584842').members.cache.get(message.author.id).roles.cache.has('764922979338944512') ||
        !this.client.guilds.cache.get('631467420510584842').members.cache.get(message.author.id).roles.cache.has('764922809985138698')
    ) return

    const guildLeave = args[0]

    this.client.guilds.cache.get(guildLeave).leave()
  }
}

module.exports = GuildLeave;