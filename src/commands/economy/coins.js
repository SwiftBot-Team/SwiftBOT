const Base = require("../../services/Command");

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

class Coins extends Base {
  constructor(client) {
    super(client, {
      name: "coins",
      description: "descriptions:coins",
      category: "categories:economy",
      usage: "usages:coins",
      cooldown: 1000,
      aliases: ['money', 'balance', 'saldo']
    })
  }

  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)

    if (['enviar', 'send', 'transferir', 'transfer'].includes(args[0])) {
      const [user] = this.getUsers()
      if (!user) return message.respond(t('commands:coins.noUser'))
      const amount = args[2]

      if (!amount || isNaN(amount) || amount[0] === '-') return message.respond(t('commands:coins.not'))

      if (amount > await this.client.controllers.money.getBalance(message.author.id)) {
        return message.respond(t('commands:coins.notHave'))
      }

      this.client.controllers.money.transf(message.author.id, user.id, amount)
      return message.respond(t('commands:coins.okDeposit'))
    }

    const user = this.getUsers()[0]

    if (user) {
      let msg

      let money = await this.client.controllers.money.getBalance(user.id)
      money = numberWithCommas(money)

      let bank = await this.client.controllers.money.getBalanceInBank(user.id)

      if (isNaN(bank) || bank === false) msg = t('commands:coins.withoutBank', { user: user.user.username })
      else msg = t('commands:coins.userMoneyBank', { user: user.user.username, bank })

      return message.channel.send(
        Embed
          .setTitle(`<a:dinheiro:815230130695438376> ${user.user.username}`)
          .setDescription(
            `${t('commands:coins.moneyUser', { user: user.user.username, money })} \n\n`
            + `${msg}`
          )
      )
    } else {
      let msg

      let money = await this.client.controllers.money.getBalance(message.author.id)
      money = numberWithCommas(money)

      let bank = await this.client.controllers.money.getBalanceInBank(message.author.id)

      if (isNaN(bank) || bank === false) msg = t('commands:coins.withoutBankAuthor')
      else msg = t('commands:coins.moneyBank', { bank })

      return message.channel.send(
        Embed
          .setTitle(`<a:dinheiro:815230130695438376> ${message.author.username}`)
          .setDescription(
            `${t('commands:coins.money', { money })} \n\n`
            + `${msg}`
          )
      )
    }
  }
}
module.exports = Coins