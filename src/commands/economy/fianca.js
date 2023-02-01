const Base = require("../../services/Command");

class Fianca extends Base {
  constructor(client) {
    super(client, {
      name: "fianca",
      description: "descriptions:fianca",
      category: "categories:economy",
      cooldown: 20000,
      aliases: ['bail', 'fiança']
    })
  }

  async run({ message, args, prefix }, t) {
    if (!await this.client.controllers.money.jailed(message.author.id)) return message.respond(t('commands:fianca.notJail'))

    const userMoney = await this.client.controllers.money.getBalance(message.author.id);

    if (userMoney < 5000) return message.respond(t('commands:fianca.money', { 1: 5000 - userMoney }))

    await this.client.controllers.money.setBalance(message.author.id, -5000)
    await this.client.controllers.money.unJail(message.author.id)

    return message.respond(t('commands:fianca.ok'))
  }
}
module.exports = Fianca