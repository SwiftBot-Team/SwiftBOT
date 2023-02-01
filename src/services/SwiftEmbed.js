const { MessageEmbed } = require('discord.js')

module.exports = class SwiftEmbed extends MessageEmbed {
  constructor (user, data = {}) {
    super(data)
    this.setColor('#2f3136')

    if (user && user.displayAvatarURL()) this.setFooter(user.username, user.displayAvatarURL())
  }

  setDescriptionFromBlockArray (blocks) {
    this.description = blocks.map(lines => lines.filter(l => !!l).join('\n')).filter(b => !!b.length).join('\n\n')
    return this
  }
}
