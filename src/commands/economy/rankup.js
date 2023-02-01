const Base = require("../../services/Command");
const Ranks = require('../../utils/Ranks')

class Rankup extends Base {
  constructor(client) {
    super(client, {
      name: "rankup",
      description: "descriptions:rankup",
      category: "categories:economy",
      cooldown: 1000,
      aliases: ['up', 'upar']
    })
  }

  async run({ message, args, prefix }, t) {
    const coins = await this.client.controllers.money.getBalance(message.author.id),
      rank = Object.values(Ranks)[await this.client.controllers.money.getRank(message.author.id) + 1],
      user = message.author

    if (await this.client.controllers.money.getRank(message.author.id) === 8) return message.respond(`<:Errado:804857898030989334> ${t('commands:rankup.error1')}`)
    if (coins < rank.costs) return message.respond(`<:Errado:804857898030989334> ${t('commands:rankup.error')}`)

    let confirm = await this.confirmationBox(message.author, message.channel, new this.client.embed(message.author).setDescription(t('commands:rankup.confirm', {coins: rank.costs})))

    if (confirm) {
      await this.client.controllers.money.setRank(message.author.id, await this.client.controllers.money.getRank(message.author.id) + 1)
      await this.client.controllers.money.setBalance(message.author.id, -rank.costs)
      await this.client.controllers.money.setInteligence(message.author.id, +1)
      if (!await this.client.controllers.money.hasBank(message.author.id)) await this.client.controllers.money.buyBank(message.author.id)
      
      const Embed = new this.client.embed()
        .setAuthor(user.username, user.displayAvatarURL())
        .setDescription(`<:Correto:805054626448670762> **»** ${t('commands:rankup.up')}${await this.client.controllers.money.getRank(user.id)}`)
        .setTimestamp()

      return message.channel.send(Embed)
    } else {
      message.respond(t('commands:rankup.cancel'))
    }
  }
}
module.exports = Rankup