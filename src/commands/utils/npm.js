const Base = require("../../services/Command");
const searchNpmRegistry = require('search-npm-registry')

class NPM extends Base {
  constructor(client) {
    super(client, {
      name: "npm",
      description: "descriptions:npm",
      category: "categories:utils",
      usage: "usages:npm",
      cooldown: 1000,
      aliases: ['search-npm', 'npm-search']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const search = args.join(' ')

    if (!search) return this.respond(t('commands:npm.notSearch'), false, { footer: `${prefix}npm ${t(this.help.usage)}`, author: { text: message.author.username, image: message.author.displayAvatarURL() } })

    const [npm] = await searchNpmRegistry()
      .text(search)
      .size(5)
      .search();

    const Embed = new this.client.embed(message.author)
      .setThumbnail('https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png')
      .addField(t('commands:npm.description'), npm.description ? npm.description : t('commands:npm.notDescription'))
      .setTitle('<:swiftDab:754827711272321035> '+npm.name)
      .setDescriptionFromBlockArray([
        [
          npm.keywords && npm.keywords.length > 0 ? '**»** '+npm.keywords.map(k => `\`${k}\``).join(', ') : null
        ],
        [
          `${t('commands:npm.package')} [${npm.name}](${npm.links.npm})`
        ],
        [
          "⠀"
        ]
      ])

    message.channel.send(Embed)
    
  }
}
module.exports = NPM