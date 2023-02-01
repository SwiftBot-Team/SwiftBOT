const Guild = require('../../database/models/Guild')

module.exports = class AntiInvite {
  constructor(client) {
    this.client = client
  }

  async run() {
    this.client.on('message', async (message) => {
      if (message.channel.type === 'dm' || !message.member) return;
      if (message.member.hasPermission("ADMINISTRATOR")) return;
      if (message.author.bot) return;

      const ref = await this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}`).once('value');

      if (!ref.val() || !ref.val().stats) return;

      if (ref.val().permissions && Object.values(ref.val().permissions).map(id => id.id).some(id => message.author.id === id || message.channel.id === id || (message.member.roles && message.member.roles.cache.has(id)))) return;
      
      if(!message.deletable) return;
      
      let t = await this.client.getTranslate(message.guild.id);

      let regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g

      if (regex.test(message.content)) {
        message.delete({ timeout: 0 })
        return await message.channel.send(t('automod:inviteDetected.msg', { user: message.author.username }))
      }
    })
  }
}
