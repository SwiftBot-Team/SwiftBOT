const Base = require("../../services/Command");

class TopMoney extends Base {
  constructor(client) {
    super(client, {
      name: "top-money",
      description: "descriptions:top",
      category: "categories:economy",
      cooldown: 1000,
      aliases: ['topmoney', 'top', 'moneytop']
    })
  }
 
  async run({ message, args, prefix }, t) {
    if (await this.client.controllers.money.jailed(message.author.id)) return this.respond(t('errors:isJailed'))

    const ref = await this.client.database.ref('SwiftBOT/Economia/').once('value');

    let allValues = Object.values(ref.val());

    const sort = allValues.sort((a, b) => (b.coins + b.bank) - (a.coins + a.bank));

    const embed = new this.client.embed()
        .setAuthor("Swift - Money TOP");

    const users = {}
    Object.keys(ref.val()).map((k, i) => {
        users[k] = { top: sort[i].bank + sort[i].coins }
    })

    Object.keys(users).slice(0, 9).map((u, i) => embed.addField(`${i + 1}º - ${this.client.users.cache.get(u)}`, `Money: ${users[u].top}`))
  
    message.channel.send(embed)
  }
}
module.exports = TopMoney