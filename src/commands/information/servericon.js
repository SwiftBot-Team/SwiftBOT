const Base = require("../../services/Command");

class ServerIcon extends Base {
  constructor(client) {
    super(client, {
      name: "servericon",
      description: "descriptions:servericon",
      usages: "usages:servericon",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["sc", "icon", "guildicon"]
    });
  }

  run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)

    if (args[0]) {
      let id = args[0]

      const guild = this.client.guilds.cache.get(id)
      if (!guild) return this.respond(t('commands:servericon.notFound'))

      Embed
        .setAuthor(guild.name, guild.iconURL())
        .setDescription(t('commands:servericon.description', { link: guild.iconURL() }))
        .setImage(guild.iconURL({ size: 2048, dynamic: true }))

      return message.channel.send(Embed)
    } else {
      let id = message.guild.id

      const guild = this.client.guilds.cache.get(id)

      Embed
        .setAuthor(guild.name, guild.iconURL())
        .setDescription(t('commands:servericon.description', { link: guild.iconURL() }))
        .setImage(guild.iconURL({ size: 2048, dynamic: true }))

      return message.channel.send(Embed)
    }
  }
}

module.exports = ServerIcon;