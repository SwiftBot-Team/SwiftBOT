const Base = require("../../services/Command");

const Guild = require('../../database/models/Guild')

const i18n = require('i18next')

class Language extends Base {
  constructor(client) {
    super(client, {
      name: "language",
      cooldown: 1000,
      aliases: ["lang", "set-lang"],
      permissions: ['MANAGE_GUILD']
    });
  }

  async run({ message, args, prefix }, t) {
    let guild = await Guild.findOne({ guildID: message.guild.id })

    const option = args[0]
    if (!['setar', 'restaurar', 'set', 'restore'].includes(option) || !option) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:language.invalidOption')))

    if (option === "setar" || option === "set") {
      let lang = args[1]

      if (!lang || !['pt', 'en'].includes(lang)) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' +t('commands:language.invalidNewLanguage')))

      t = i18n.getFixedT(lang)

      guild.lang = lang;
      guild.save();

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' +t('commands:language.confirmation'))
      )
    }

    if (option === 'restaurar' || option === 'restore') {
      t = i18n.getFixedT(lang)
      
      guild.lang = 'pt';
      guild.save();

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' +t('commands:language.confirmation'))
      )
    }
  }
}

module.exports = Language;