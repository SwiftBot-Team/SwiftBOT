const Base = require("../../services/Command");
const searchNpmRegistry = require('search-npm-registry');
const NpmSearcher = require("../../services/NpmSearcher");

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

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

    if (!search) return message.respond(t('commands:npm.notSearch'), false, { footer: `${prefix}npm ${t(this.help.usage)}`, author: { text: message.author.username, image: message.author.displayAvatarURL() } })

    const data = await NpmSearcher(search)

    if (!data) return message.respond(t('commands:npm.error'))
    const npm = data.searchData.package

    const Embed = new this.client.embed(message.author)
      .setThumbnail('https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png')
      .addField(t('commands:npm.description'), npm.description ? npm.description : t('commands:npm.notDescription'))
      .setTitle('<:swiftDab:754827711272321035> » '+npm.name)
      .setDescriptionFromBlockArray([
        [
          npm.keywords && npm.keywords.length > 0 ? '**»** '+npm.keywords.map(k => `\`${k}\``).join(', ') : null
        ],
        [
          `${t('commands:npm.publisher')} ${npm.publisher.username}`
        ],
        [
          `${t('commands:npm.package')} [${npm.name}](${npm.links.npm})`
        ],
        [
          `${t('commands:npm.downloads')} \`${numberWithCommas(data.downloadsData.downloads)}\``
        ],
        [
          `${t('commands:npm.version')} \`${npm.version}\``
        ],
        [
          "⠀"
        ]
      ])

    message.channel.send(Embed)
    
  }
}
module.exports = NPM