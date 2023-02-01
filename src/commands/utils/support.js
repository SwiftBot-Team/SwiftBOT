const Base = require("../../services/Command");
const Discord = require('discord.js')

class Support extends Base {
  constructor(client) {
    super(client, {
      name: "support",
      description: "descriptions:support",
      category: "categories:utils",
      cooldown: 1000,
      aliases: ['suporte']
    })
  }

  async run({ message, args, prefix }, t) {
    const attachment = new Discord.MessageAttachment('src/assets/Support.png', 'Suporte.png')

    const Embed = new this.client.embed(message.author)
      .setDescription(`<:swiftLove:754841489510629477> ${t('commands:support.click')}`)
      .attachFiles(attachment)
      .setImage('attachment://Suporte.png')

    return message.channel.send(Embed)
  }
}
module.exports = Support