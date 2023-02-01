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

    const option = args[0]
    if (!['setar', 'restaurar', 'set', 'restore'].includes(option) || !option) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:language.invalidOption')))

    if (option === "setar" || option === "set") {
      let lang = args[1]

      if (!lang || !['pt'].includes(lang)) return message.channel.send(new this.client.embed(message.author).setDescription('<:errado:739176302317273089> » ' + t('commands:language.invalidNewLanguage')))
      
      await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/lang`).set(lang);
      
      this.client.languages.set(message.guild.id, lang)

      t = await this.client.getTranslate(message.guild.id)

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' + t('commands:language.confirmation'))
      )
    }

    if (option === 'restaurar' || option === 'restore') {
      
      await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/config/lang`).set('pt');
      
      this.client.languages.set(message.guild.id, 'pt')

      t = this.client.getTranslate(message.guild.id)

      message.channel.send(new this.client.embed(message.author)
        .setDescription('<a:certo:739210631441547296> » ' + t('commands:language.confirmation'))
      )
    }
  }
}

module.exports = Language;
