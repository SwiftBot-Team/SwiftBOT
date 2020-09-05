const Base = require("../../services/Command");

class Convite extends Base {
  constructor(client) {
    super(client, {
      name: "convite",
      description: "descriptions:convite",
      category: "categories:info",
      cooldown: 1000,
      aliases: ['invite']
    })
  }

  async run({ message, args, prefix }, t) {
    let msg = await message.channel.send(t('commands:convite.1'))

    message.author.send(new this.client.embed().setDescription(t('commands:convite.2')))
      .catch(() => message.channel.send(t('errors:private')))

    msg.delete({ timeout: 5000 })
  }
}
module.exports = Convite