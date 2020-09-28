const Guild = require('../../database/models/Guild')

module.exports = class AntiInvite {
  constructor(client) {
    this.client = client
  }

  async run() {
    this.client.on('message', async (message) => {
      
      if (message.guild.id === '747420727908630658' || message.guild.id === '729715039413469345') return
      let t = await this.client.getTranslate(message.guild)

      if (message.channel.type === "dm") return;

      let regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g

      if (regex.test(message.content)) {
        return await message.channel.send(t('automod:inviteDetected.msg', { user: message.author.username }))
      }
    })
  }
}