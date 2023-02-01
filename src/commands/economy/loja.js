const Base = require("../../services/Command");
const Collection = require('../../services/Collection');
const Store = require("../../utils/Store");

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
    x = x.replace(pattern, "$1 $2");
  return x;
}


class Loja extends Base {
  constructor(client) {
    super(client, {
      name: "loja",
      description: "descriptions:loja",
      category: "categories:economy",
      usage: "usages:loja",
      cooldown: 1000,
      aliases: ['store', 'buy']
    })
  }

  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)
    const itens = new Collection();

    Store(t).map(s => {
      itens.push(s)
    })

    if (['info', 'information', 'informacao'].includes(args[0])) {
      const i = itens.collection.find(i => i.id === Number(args[1]))
      if (!i) return message.respond(t('commands:loja.exists'))
      Embed
        .setTitle(i.title)
        .setDescription(`<:desc:815349007693643847> ${i.description}\n\n<a:dinheiro:815230130695438376> ${i.amount} `)
        .setThumbnail(i.img)

      return message.channel.send(Embed)
    }

    if (['comprar', 'buy', 'store'].includes(args[0])) {
      const i = itens.collection.find(i => i.id === Number(args[1]))
      if (!i) return message.respond(t('commands:loja.exists'))
      if (await this.client.controllers.money.getBalance(message.author.id) < i.amount) return message.respond(t('commands:loja.dontMoney'))
      
      const db = await this.client.database.ref(`SwiftBOT/users/${message.author.id}/stamp`).once('value')
      if (db.val() >= i.id) return message.respond(t('commands:loja.already'))

      await this.client.controllers.money.setBalance(message.author.id, -i.amount)
      await i.buy(message.author.id, this.client.database)
      Embed
        .setDescription(t('commands:loja.ok'))
        .setImage(i.img)

      return message.channel.send(Embed)
    }

    Embed
      .setDescription(t('commands:loja.use', { prefix }))
      .setAuthor(t('commands:loja.title'), 'https://cdn.discordapp.com/emojis/751390656777289798.png?v=1')

    itens.collection.map(i => {
      Embed
        .addField(
          `\`${i.id}\` - ${i.title}`, 
          `<:desc:815349007693643847> ${i.description} \n<a:dinheiro:815230130695438376> ${numberWithCommas(i.amount)} sCoins\n⠀`
        )
    })

    return message.channel.send(Embed)
  }
}
module.exports = Loja