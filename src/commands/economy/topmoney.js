const Base = require("../../services/Command");

class TopMoney extends Base {
  constructor(client) {
    super(client, {
      name: "top-money",
      description: "descriptions:top",
      category: "categories:economy",
      cooldown: 1000,
      aliases: ['topmoney', 'top', 'moneytop', 'money-top']
    })
  }

  async run({ message, args, prefix }, t) {
    if (await this.client.controllers.money.jailed(message.author.id)) return message.respond(t('errors:isJailed'))

    const ref = await this.client.database.ref('SwiftBOT/Economia/').once('value');

    let allValues = ref.val();

    const sort = Object.values(allValues).sort((a, b) => (b.coins + (b.bank || 0)) - (a.coins + (a.bank || 0)));

    const users = []

    sort.map((value, i) => {
      Object.values(allValues).map((user, i) => {
        if (user === value) {
          if (!this.client.users.cache.get(Object.keys(allValues)[i])) return
          users.push({ user: Object.keys(allValues)[i], bank: user.bank || 0, coins: user.coins })
        }
      })
    })

    const embed = new this.client.embed()
      .setAuthor("Swift - Money TOP", this.client.user.displayAvatarURL())
      .setDescription(`⠀`)
      .setTimestamp()

      const m = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
      };

    users.slice(0, 5).map((u, i) => {
      embed.addField(`${m[i + 1] || ''} ${i + 1}º - ${this.client.users.cache.get(u.user).username}`, `Coins: \`${u.coins}\` | Banco: \`${u.bank}\``)
    })

    message.channel.send(embed);
  }
}
module.exports = TopMoney