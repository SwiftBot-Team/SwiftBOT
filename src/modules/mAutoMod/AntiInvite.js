const i18n = require('i18next')
const Guild = require('../../database/models/Guild')

module.exports = class AntiInvite {
  constructor(client) {
    this.client = client
  }

  async run() {
    this.client.on('message', async (message) => {
      let t = i18n.getFixedT(await this.client.getLanguage(message.guild, Guild))

      let regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g

      if (regex.test(message.content)) {
        return message.channel.send(t('automod:inviteDetected', { user: message.author.username }))
      }
    })
  }
}