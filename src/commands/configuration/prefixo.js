const Base = require("../../services/Command");

const guildDB = require('../../database/models/Guild')

class Prefixo extends Base {
  constructor(client) {
    super(client, {
      name: "prefix",
      cooldown: 1000,
      aliases: ["prefixo", "setprefix"],
      permissions: ["MANAGE_SERVER"],
      usage: 'usages:prefixo'
    });
  }

  async run({ message, args, prefix }, t) {
    let guild = await guildDB.findOne({ guildID: message.guild.id })

    const option = args[0]
    if (!['setar', 'restaurar', 'set', 'restore'].includes(option) || !option) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:prefixo.invalidOption')))


    if (option === "setar" || option === 'set') {
      let prefixo = args[1]

      if (!prefixo) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:prefixo.invalidNewPrefix')))

      guild.prefix = prefixo
      guild.save()

      this.client.prefixes.set(message.guild.id, prefixo)

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' + t('commands:prefixo.confirmation'))
      )
    }

    if (option === 'restaurar' || option === 'restore') {
      guild.prefix = 's!'
      guild.save()

      this.client.prefixes.set(message.guild.id, 's!')

      message.channel.send(new this.client.embed(message.author)
        .setTitle('<a:certo:739210631441547296> » ' + t('commands:prefixo.confirmation'))
      )
    }
  }
}

module.exports = Prefixo;