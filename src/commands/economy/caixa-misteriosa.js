const Base = require("../../services/Command");
const Image = require('../../services/Images')
const Discord = require('discord.js')

function gerar(quantidade) {
  let resultado = "";
  let caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let quantidadecaracteres = caracteres.length;
  for (let i = 0; i < quantidade; i++) {
    if (resultado.length === 3 || resultado.length === 7) resultado += ' '

    resultado += caracteres.charAt(Math.floor(Math.random() * quantidadecaracteres));
  }
  return resultado
}

class MysteryBox extends Base {
  constructor(client) {
    super(client, {
      name: "caixa-misteriosa",
      description: "descriptions:caixa-misteriosa",
      category: "categories:economy",
      cooldown: 1000,
      aliases: ['mystery-box', 'box']
    })
  }

  async run({ message, args, prefix }, t) {
    if (await this.client.controllers.money.jailed(message.author.id)) return message.respond(t('errors:isJailed'))

    if (await this.client.controllers.money.getBalance(message.author.id) < 1000) return message.respond(t('commands:mysterybox.coins'))

    await this.client.controllers.money.setBalance(message.author.id, -1000)

    const code = gerar(9).toUpperCase()
    const image = await new Image(message.author).loadGift(code)

    await message.channel.send(t('commands:mysterybox.ok'), new Discord.MessageAttachment(image))

    const collector = message.channel.createMessageCollector(x => x, { time: 10000, max: 1, errors: ['time'] })
      .on('collect', async r => {
        if (r.content === code) {
          collector.stop()

          const random = Math.floor(Math.random() * 1000)

          await this.client.controllers.money.setBalance(message.author.id, random)
          return message.respond(t('commands:mysterybox.code', { thing: `\`${random} sCoins!\`` }))
        } else {
          collector.stop()
          return message.respond(t('commands:mysterybox.endCode'))
        }
      })
      .on('end', async r => {
        if (collector.endReason() === 'limit') return;

        return message.respond(t('commands:mysterybox.end'))
      })
  }
}
module.exports = MysteryBox