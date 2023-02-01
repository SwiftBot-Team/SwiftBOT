const Base = require("../../services/Command");
const isURL = require('is-url')

class IsItUp extends Base {
  constructor(client) {
    super(client, {
      name: "isitup",
      description: "descriptions:isitup", 
      category: "categories:utils",
      usages: "usages:isitup",
      cooldown: 1000,
      aliases: ["websiteup"]
    })
  }
 
  async run({ message, args, prefix }, t) {
    const website = args.join(` `)

    if (!website || !isURL(website)) return message.respond(t('commands:isitup.args'))

    let result = await this.client.apis.isitup.check(website)

    let Embed = new this.client.embed()
      .setTitle(`<:Duvida:807665311373459457> **»** ${t('commands:isitup.question')}`)
      .setDescription(
        result.online
          ? t('commands:isitup.yes', { website, rescode: String(result.code), ping: result.time })
          : t('commands:isitup.not', { website })
      )

    message.channel.send(Embed)
  }
}
module.exports = IsItUp