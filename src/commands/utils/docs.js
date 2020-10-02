const Base = require("../../services/Command");
const axios = require('axios')

class Docs extends Base {
  constructor(client) {
    super(client, {
      name: "docs",
      description: "descriptions:docs",
      category: "categories:utils",
      usage: "usages:docs",
      cooldown: 1000,
      aliases: ['discordjsdocs', 'djs']
    })
  }

  async run({ message, args, prefix, language }, t) {
    const search = args.join(' ')

    if (!search) return this.respond(t('commands:docs.error'))

    const { data } = await axios.get(`https://djsdocs.sorta.moe/v1/main/master/embed?q=${search}`)
    if (!data || data === undefined || !data.fields || !data.fields.length) return this.respond(t('commands:docs.nothing', { item: search }))

    const Embed = new this.client.embed()
      .setAuthor(t('commands:docs.author'), 'https://discord.js.org/favicon.ico', 'https://discord.js.org/#/docs/main/master')
      .setDescription(data.description + "\n\n" + data.fields.map(field => `${field.name} \n ${field.value}`).join("\n\n"))


    message.channel.send(Embed)

  }
}
module.exports = Docs