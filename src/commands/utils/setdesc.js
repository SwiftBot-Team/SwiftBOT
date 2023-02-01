const Base = require("../../services/Command");

class SetDesc extends Base {
  constructor(client) {
    super(client, {
      name: "setdesc",
      description: "descriptions:setdesc",
      category: "categories:utils",
      usage: "usages:setdesc",
      cooldown: 1000,
      aliases: ['set-desc', 'setdescription', 'setsobre', 'setabout']
    })
  }

  async run({ message, args, prefix }, t) {
    const desc = args.join(' ')

    if (!desc) return message.respond(t('commands:setdesc.error', { user: message.author.username }), false)

    await this.client.database.ref(`SwiftBOT/users/${message.author.id}/about`).set({
      text: desc,
      time: Date.now()
    })

    return message.respond(t('commands:setdesc.confirm', { user: message.author.username }), false)
  }
}
module.exports = SetDesc