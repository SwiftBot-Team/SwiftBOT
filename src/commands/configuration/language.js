const Base = require("../../services/Command");

const Guild = require('../../database/models/Guild')

class Language extends Base {
  constructor(client) {
    super(client, {
      name: "language",
      cooldown: 1000,
      aliases: ["lang", "set-lang"],
      permissions: ['MANAGE_GUILD'],
      category: "categories:config",
      description: "descriptions:language"
    });
  }

  async run({ message, args, prefix }, t) {
    let guild = await Guild.findOne({ guildID: message.guild.id })

    const option = args[0]
    if (!['setar', 'restaurar', 'set', 'restore'].includes(option) || !option) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:language.invalidOption')))

    if (option === "setar" || option === "set") {
      let lang = args[1]

      if (!lang || !['pt', 'en'].includes(lang)) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:language.invalidNewLanguage')))

      t = await this.client.getTranslate(message.guild.id)

      guild.lang = lang;
      guild.save();

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' + t('commands:language.confirmation'))
      )
    }

    if (option === 'restaurar' || option === 'restore') {
      guild.lang = 'pt';
      guild.save();

      t = this.client.getTranslate(message.guild.id)

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' + t('commands:language.confirmation'))
      )
    }
  }
}

module.exports = Language;