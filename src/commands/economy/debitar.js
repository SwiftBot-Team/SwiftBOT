const Base = require("../../services/Command");

class Debitar extends Base {
  constructor(client) {
    super(client, {
      name: "debitar",
      description: "descriptions:debitar",
      category: "categories:economy",
      usage: "usages:debitar",
      cooldown: 1000,
      aliases: ['retirar']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const amount = args[0]

    if (!amount || isNaN(amount) || amount[0] === '-') return this.respond(t('commands:debitar.not'))
  
    if (await this.client.controllers.money.getBalanceInBank(message.author.id) < amount) return this.respond(t('commands:debitar.notMoney'))

    const taxa = (5*amount)/100
    await this.client.controllers.money.debit(message.author.id, amount-taxa)
    return this.respond(t('commands:debitar.ok'), true, { thumbnail: 'https://cdn.discordapp.com/emojis/752530660459151482.png?v=1' })
  }
}
module.exports = Debitar