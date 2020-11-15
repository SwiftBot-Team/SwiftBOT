const Base = require("../../services/Command");

class Daily extends Base {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "descriptions:daily",
      category: "categories:economy",
      cooldown: 1,
      aliases: ["diario"]
    })
  }
 
  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)
      .setThumbnail('https://cdn.discordapp.com/emojis/752530659167436880.png?v=1')

    if (await this.client.controllers.money.jailed(message.author.id)) return this.respond(t('errors:isJailed'))
  
    const canGetDaily = await this.client.controllers.money.canGetDaily(message.author.id)

    if (!canGetDaily.can) {
      Embed
        .setDescription(t('commands:daily.not', { remain: canGetDaily.remain }))

      return message.channel.send(Embed)
    }
    else {
      const daily = await this.client.controllers.money.getDaily(message.author.id)
      this.respond(t('commands:daily.ok', { daily }))
    }
  }
}
module.exports = Daily