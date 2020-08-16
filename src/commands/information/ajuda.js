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

    if (args[0]) {
      let cmd = this.client.commands.find(c => c.help.name.toLowerCase() === args[0] || (c.conf.aliases && c.conf.aliases.includes(args[0])));
      if (cmd) {

        let userPermissions = []
        if (cmd.conf.permissions.length > 1) {
          cmd.conf.permissions.map(p => {
            userPermissions.push(t('permissions:'+p))
          })
        }

        let botPermissions = []
        if (cmd.conf.bot_permissions.length > 1) {
          cmd.conf.bot_permissions.map(p => {
            botPermissions.push(t('permissions:'+p))
          })
        }

        Embed
          .setTitle(t('commands:ajuda:commandHelp.title', { cmd: cmd.help.name }))
          .setDescription(t(cmd.help.description))
          .addField(`${t('commands:ajuda:commandHelp.field1')}`, `\`${cmd.conf.aliases.join(', ')}\``)
          .addField(`${t('commands:ajuda:commandHelp.field2')}`, `\`${prefix}${cmd.help.name} ${t(cmd.help.usage)}\``)
          .addField(`${t('commands:ajuda:commandHelp.field3')}`, `\`${!cmd.conf.permissions[0] ? t('commands:ajuda.nothing') : (cmd.conf.permissions.length > 1 ? userPermissions.join(' | ') : t('permissions:'+cmd.conf.permissions[0])) }\``)
          .addField(`${t('commands:ajuda:commandHelp.field4')}`, `\`${!cmd.conf.bot_permissions[0] ? t('commands:ajuda.nothing') : (cmd.conf.bot_permissions.length > 1 ? botPermissions.join(' | ') : t('permissions:'+cmd.conf.bot_permissions[0])) }\``)

        message.channel.send(Embed)
      } else {
        Embed
          .setTitle(t('commands:ajuda:no_command_embed.title', { cmd: args[0] }))

        return message.channel.send(Embed)
      }
    } else {
      let embed = new this.client.embed()
        .setAuthor("Swift - Ajuda", this.client.user.displayAvatarURL())
        .addField('Outros', `Nenhum`)
        .addField('Info', this.client.commands.filter(c => c.help.category === 'categories.info').map(c => c.help.name).join(', '))
      await message.channel.send(embed)
    }
  }
}

module.exports = Ajuda;