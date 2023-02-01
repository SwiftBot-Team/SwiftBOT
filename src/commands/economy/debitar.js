const Base = require("../../services/Command");
const Ranks = require('../../utils/Ranks')

class Debitar extends Base {
  constructor(client) {
    super(client, {
      name: "debitar",
      description: "descriptions:debitar",
      category: "categories:economy",
      usage: "usages:debitar",
      cooldown: 1000,
      aliases: ['retirar', 'remover', 'deb']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const amount = args[0]
    const rank = Object.values(Ranks)[await this.client.controllers.money.getRank(message.author.id)]

    if (!await this.client.controllers.money.hasBank(message.author.id)) return message.respond(t('commands:debitar.bank'))

    if (!amount || isNaN(amount) || amount[0] === '-') return message.respond(t('commands:debitar.not'))
  
    if (await this.client.controllers.money.getBalanceInBank(message.author.id) < amount) return message.respond(t('commands:debitar.notMoney'))

    await this.client.controllers.money.setBalance(message.author.id, Math.floor(amount-(Number(amount)*rank.tax)))
    await this.client.controllers.money.setBalanceInBank(message.author.id, -Math.floor(Number(amount)))
    return message.respond(t('commands:debitar.ok', { tax: String(rank.tax)[3], amount: Math.floor(Number(amount)-(Number(amount)*rank.tax)) }), true, { thumbnail: 'https://cdn.discordapp.com/emojis/752530660459151482.png?v=1' })
  }
}
module.exports = Debitar