const Base = require("../../services/Command");
const Ranks = require('../../utils/Ranks')

class Depositar extends Base {
  constructor(client) {
    super(client, {
      name: "depositar",
      description: "descriptions:depositar",
      category: "categories:economy",
      usage: "usages:depositar",
      cooldown: 1000,
      aliases: ['dep']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const amount = args[0]
    const rank = Object.values(Ranks)[await this.client.controllers.money.getRank(message.author.id)]

    if (!await this.client.controllers.money.hasBank(message.author.id) || !rank.limit) return message.respond(t('commands:depositar.bank'))

    if (!amount || isNaN(amount) || amount[0] === '-') return message.respond(t('commands:depositar.not'))
  
    if (await this.client.controllers.money.getBalance(message.author.id) < Number(amount)) return message.respond(t('commands:depositar.notMoney'))
    if (rank.limit < (await this.client.controllers.money.getBalanceInBank(message.author.id) + Number(amount))) return message.respond(t('commands:depositar.error', { limit: rank.limit || 0 }))

    await this.client.controllers.money.setBalanceInBank(message.author.id, Math.floor(amount-(Number(amount)*rank.tax)))
    await this.client.controllers.money.setBalance(message.author.id, -Math.floor(Number(amount)))
    return message.respond(t('commands:depositar.ok', { tax: String(rank.tax)[3], amount: Math.floor(amount-(amount*rank.tax)) }), true, { thumbnail: 'https://cdn.discordapp.com/emojis/752530660459151482.png?v=1' })
  }
}
module.exports = Depositar