const Base = require("../../services/Command");

class Apostar extends Base {
  constructor(client) {
    super(client, {
      name: "apostar",
      description: "descriptions:apostar",
      category: "categories:economy",
      usage: "usages:apostar",
      cooldown: 1000,
      aliases: ['aposta']
    })
  }

  async run({ message, args, prefix }, t) {
    if (await this.client.controllers.money.jailed(message.author.id)) return message.respond(t('errors:isJailed'))

    let number = args[0];
    let quanti = args[1];

    if (!number || isNaN(number) || number[0] === '-' || Number(number) > 5 || Number(number) < 1) return message.respond(t('commands:apostar.not'), false, { footer: `${prefix}help apostar` })
    if (!quanti || isNaN(quanti) || quanti[0] === '-' || await this.client.controllers.money.getBalance(message.author.id) < quanti) return message.respond(t('commands:apostar.not1'))
  
    const confirm = await this.confirmationBox(
      message.author, 
      message.channel,
      t('commands:apostar.confirm', { coins: quanti })
    )

    if (confirm) {
      const random = Math.floor(Math.random() * (5 - 1 + 1) ) + 1;

      if (random !== Number(number)) {
        await this.client.controllers.money.setBalance(message.author.id, -Number(quanti))
        message.respond(t('commands:apostar.no'))
      } else {
        await this.client.controllers.money.setBalance(message.author.id, Number(quanti)*2)
        message.respond(t('commands:apostar.yes'))
      }
    } else {
      return message.respond(t('commands:apostar.cancel'))
    }
  }
}
module.exports = Apostar