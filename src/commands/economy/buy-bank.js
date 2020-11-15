const Base = require("../../services/Command");

class BuyBank extends Base {
  constructor(client) {
    super(client, {
      name: "buy-bank",
      description: "descriptions:buy-bank",
      category: "categories:economy",
      cooldown: 1000,
      aliases: ['comprar-banco', 'banco-comprar', 'buy-a-bank']
    })
  }
 
  async run({ message, args, prefix }, t) {
    if (await this.client.controllers.money.jailed(message.author.id)) return this.respond(t('errors:isJailed'))

    if (await this.client.controllers.money.hasBank(message.author.id)) return this.respond(t('commands:buy-bank.notOk'))

    const balance = await this.client.controllers.money.getBalance(message.author.id)
    if (balance < 5000) return this.respond(t('commands:buy-bank.not', { buy: 5000-balance }))
  
    await this.client.controllers.money.buyBank(message.author.id)
    return this.respond(t('commands:buy-bank.ok'), true, { thumbnail: 'https://images-ext-2.discordapp.net/external/2xfjFjikVBt7h2QYMABgBJ1H7-8HQa4WDFuFIJuKqSA/%3Fv%3D1/https/cdn.discordapp.com/emojis/754827711272321035.png' })
  }
}
module.exports = BuyBank