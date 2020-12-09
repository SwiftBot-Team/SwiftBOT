const Base = require("../../services/Command");

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

    if (!await this.client.controllers.money.hasBank(message.author.id)) return this.respond(t('commands:depositar.bank'))

    if (!amount || isNaN(amount) || amount[0] === '-') return this.respond(t('commands:depositar.not'))
  
    if (await this.client.controllers.money.getBalance(message.author.id) < amount) return this.respond(t('commands:depositar.notMoney'))

    await this.client.controllers.money.deposit(message.author.id, amount)
    return this.respond(t('commands:depositar.ok'), true, { thumbnail: 'https://cdn.discordapp.com/emojis/752530660459151482.png?v=1' })
  }
}
module.exports = Depositar