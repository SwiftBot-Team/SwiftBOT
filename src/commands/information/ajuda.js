const Base = require("../../services/Command");

class Ajuda extends Base {
  constructor(client) {
    super(client, {
      name: "ajuda",
      description: "descriptions:ajuda",
      category: "categories:info",
      usage: "usages:ajuda",
      cooldown: 1000,
      aliases: ["help"]
    });
  }

  async run({ message, args, prefix }, t) {
    let Embed = new this.client.embed(message.author)
    const validCommands = this.client.commands.filter(c => !c.hidden)

    if (args[0]) {
      let cmd = this.client.commands.find(c => c.help.name.toLowerCase() === args[0] || (c.conf.aliases && c.conf.aliases.includes(args[0])));
      if (cmd) {

        let userPermissions = []
        if (cmd.conf.permissions.length > 1) {
          cmd.conf.permissions.map(p => {
            userPermissions.push(t('permissions:' + p))
          })
        }

        let botPermissions = []
        if (cmd.conf.bot_permissions.length > 1) {
          cmd.conf.bot_permissions.map(p => {
            botPermissions.push(t('permissions:' + p))
          })
        }

        Embed
          .setTitle('<:swiftLove:754841489510629477> ' + t('commands:ajuda:commandHelp.title', { cmd: cmd.help.name }))
          .setThumbnail('https://cdn.discordapp.com/emojis/752530659171368981.png?v=1')
          .setDescription(t(cmd.help.description))
          .addField(`${t('commands:ajuda:commandHelp.field1')}`, `\`${cmd.conf.aliases.join(', ')}\``)
          .addField(`${t('commands:ajuda:commandHelp.field2')}`, `\`${prefix}${cmd.help.name} ${t(cmd.help.usage)}\``)
          .addField(`${t('commands:ajuda:commandHelp.field3')}`, `\`${!cmd.conf.permissions[0] ? t('commands:ajuda.nothing') : (cmd.conf.permissions.length > 1 ? userPermissions.join(' | ') : t('permissions:' + cmd.conf.permissions[0]))}\``)
          .addField(`${t('commands:ajuda:commandHelp.field4')}`, `\`${!cmd.conf.bot_permissions[0] ? t('commands:ajuda.nothing') : (cmd.conf.bot_permissions.length > 1 ? botPermissions.join(' | ') : t('permissions:' + cmd.conf.bot_permissions[0]))}\``)

        message.channel.send(Embed)
      } else {
        Embed
          .setTitle(t('commands:ajuda:no_command_embed.title', { cmd: args[0] }))

        return message.channel.send(Embed)
      }
    } else {
      Embed
        .setAuthor(`SwiftBOT - ${t('commands:ajuda.title')}`, this.client.user.displayAvatarURL());

      const lockedCmds = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).once('value');

      const locked = lockedCmds.val() || [];

      const categories = validCommands.map(c => c.help.category).filter((v, i, a) => a.indexOf(v) === i);

      categories
        .sort((a, b) => t(`${a}`).localeCompare(t(`${b}`)))
        .forEach(async (category) => {

          const commands = validCommands
            .filter(c => c.help.category === category)
            .sort((a, b) => a.help.name.localeCompare(b.name))
            .filter(c => !locked.includes(c.help.name.toLowerCase()))
            .map(c => `\`${c.help.name}\``)
            .join('**, **');


          const length = validCommands
            .filter(c => c.help.category === category).length

          Embed.addField(`${t(`${category}`)} [**${length}**]`, commands || t('commands:ajuda.noCommands'), false)
        })

      Embed.setFooter(`Use ${prefix}${this.help.name} ${t('usages:ajuda')} \n\n ${locked.length ? t('commands:ajuda.footer', { locked: locked.length || 0 }) : ''}\n`, this.client.user.displayAvatarURL())
      Embed.setThumbnail('https://cdn.discordapp.com/emojis/754841489510629477.png?v=1')

      message.channel.send(Embed)
    }
  }
}

module.exports = Ajuda;