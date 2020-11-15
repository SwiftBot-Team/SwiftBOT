const Base = require("../../services/Command");

class Roubar extends Base {
  constructor(client) {
    super(client, {
      name: "roubar",
      description: "descriptions:roubar",
      category: "categories:economy",
      usage: "usages:roubar",
      cooldown: 1000,
      aliases: ['steal', 'roubo']
    })
  }
 
  async run({ message, args, prefix }, t) {
    if (await this.client.controllers.money.jailed(message.author.id)) return this.respond(t('errors:isJailed'))

    const user = this.getUsers()[0]

    if (!user) return this.respond(t('commands:roubar.error'))

    let random = Math.floor(Math.random() * 100) 

    const dayTaxa = await this.client.controllers.money.day === 'sun' ? -10 : 10

    random = random+dayTaxa

    const money = await this.client.controllers.money.getBalance(user.id)

    if (money < 200) {
        await this.client.controllers.money.jail(message.author.id)
        return this.respond(t('commands:roubar.coinError'), true, { thumbnail: 'https://cdn.discordapp.com/emojis/752530659167436880.png?v=1' })
    }

    if (random > 30) {      
      await this.client.controllers.money.transf(user.id, message.author.id, 200)
      return this.respond(t('commands:roubar.roubo'))
    } else {
      await this.client.controllers.money.jail(message.author.id)
      return this.respond(t('commands:roubar.jail'))
    }
  }
}
module.exports = Roubar