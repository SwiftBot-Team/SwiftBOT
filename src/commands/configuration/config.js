const Base = require("../../services/Command");

class Configuration extends Base {
  constructor(client) {
    super(client, {
      name: "config",
      cooldown: 1000,
      aliases: ["configuration", "configurar"],
      usage: "usages:config",
      category: "categories:config",
      description: "descriptions:config",
      permissions: ['MANAGE_SERVER']
    });
  }

  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)

    let modules = {
      "join": {
        "emoji": "<:join:744533790386552922>",
        "title": t('commands:config:join.title'),
        "local": `SwiftBOT/Servidores/${message.guild.id}/config/join`,
        "submodules": {
          "status": {
            "title": t('commands:config:join:submodules:status.title'),
            "desc": t('commands:config:join:submodules:status.desc')
          },
          "channel": {
            "title": t('commands:config:join:submodules:channel.title'),
            "desc": t('commands:config:join:submodules:channel.desc')
          },
          "message": {
            "title": t('commands:config:join:submodules:message.title'),
            "desc": t('commands:config:join:submodules:message.desc')
          }
        }
      },
      "leave": {
        "title": t('commands:config:leave.title'),
        "emoji": "<:leave:744534182008717355>",
        "local": `SwiftBOT/Servidores/${message.guild.id}/config/leave`,
        "submodules": {
          "status": {
            "title": t('commands:config:leave:submodules:status.title'),
            "desc": t('commands:config:leave:submodules:status.desc')
          },
          "channel": {
            "title": t('commands:config:leave:submodules:channel.title'),
            "desc": t('commands:config:leave:submodules:status.desc')
          },
          "message": {
            "title": t('commands:config:leave:submodules:message.title'),
            "desc": t('commands:config:leave:submodules:status.desc')
          }
        }
      }
    }

    if (!args[0]) {
      Embed
        .setTitle(t('commands:config.noArgs'))
        .setDescriptionFromBlockArray([
          [
            t('commands:config.examples')
          ],
          [
            `\`${prefix}config ${t(this.help.usage)}\` \n`,
            `\`${prefix}config join.status\``,
            `\`${prefix}config list\``,
            `\`${prefix}config status\``
          ]
        ])

      return message.channel.send(Embed)
    }

    if (args[0] === 'list' || args[0] === 'listar') {
      if (!args[1]) {

        let module_field = Object.keys(modules)

        Embed
          .setTitle('<:module:744210050448490576> ' + t('commands:config.listJustModules'))
          .setFooter(t('commands:config.footer', { prefix, arg: args[0] }), this.client.user.displayAvatarURL())
          .setDescriptionFromBlockArray([
            [
              `${t('commands:config.format')} \n`
            ],
            module_field.map(m =>
              [
                '**' + modules[m].emoji + ' ' + modules[m].title + ':** `' + m.toString() + '`'
              ]
            )
          ])


        return message.channel.send(Embed)
      } else {
        let searchedModule = modules[args[1]]

        if (!searchedModule) return message.channel.send('<:errado:739176302317273089> ' + t('commands:config.notFound', { search: args[1] }))

        let submodules = Object.keys(searchedModule['submodules'])

        Embed
          .setTitle('<:module:744210050448490576> ' + t('commands:config.moduleInfo', { module: args[1] }))
          .setDescription(t('commands:config.formatDescription') + '\n⠀')

        submodules.map(s => {
          Embed.addField(
            '**' + searchedModule.submodules[s].title + ':**' + ' `' + s + '`', searchedModule.submodules[s].desc + `\n\`${prefix}config ${args[1]}.${s}\`\n ⠀`
          )
        })

        return message.channel.send(Embed)
      }
    } else {
      let areas = args[0].split('.')

      if (!modules[areas[0]]) {
        Embed
          .setDescription('<:errado:739176302317273089> ' + t('commands:config.notFound', { search: areas[0] }))

        return message.channel.send(Embed)
      }

      if (!areas[1]) {
        let searchedModule = modules[areas[0]]

        let submodules = Object.keys(searchedModule['submodules'])

        Embed
          .setTitle('<:module:744210050448490576> ' + t('commands:config.moduleInfo', { module: areas[0] }))
          .setDescription(t('commands:config.formatDescription') + '\n⠀')

        submodules.map(s => {
          Embed.addField(
            '**' + searchedModule.submodules[s].title + ':**' + ' `' + s + '`', searchedModule.submodules[s].desc + `\n\`${prefix}config ${areas[0]}.${s}\`\n ⠀`
          )
        })

        return message.channel.send(Embed)
      }

      if (!Object.keys(modules[areas[0]]['submodules']).includes(areas[1])) {
        Embed
          .setDescription('<:errado:739176302317273089> ' + t('commands:config.notSubmoduleFound', { search: areas[1] }))

        return message.channel.send(Embed)
      }

      const messageCollector = await message.channel.createMessageCollector(author => author.author.id === message.author.id, { time: 60000, max: 1, errors: ['time'] })
      message.channel.send(t(`commands:config:${areas[0]}:submodules:${areas[1]}.msg`))

      messageCollector.on('collect', async (r) => {
        modules[areas[0]]['submodules'][areas[1]]
        if (r.content.toLowerCase() === 'cancelar') return message.channel.send(t('commands:config.cancel'))

        if (areas[1] === 'status') {
          if (r.content.toLowerCase() === 'on' || r.content.toLowerCase() === 'off') {
            let ref = await this.client.database.ref(modules[areas[0]]['local']).once('value')

            if (!ref.val()) {
              await this.client.database.ref(modules[areas[0]]['local']).set({
                status: r.content.toLowerCase() === 'on' ? true : false,
                channel: null,
                message: null
              })

              this.respond(t(`commands:config:${areas[0]}:submodules:${areas[1]}.sucess`, {
                status: r.content.toLowerCase()
              }))
            } else {
              if (r.content.toLowerCase() === 'off') {
                await this.client.database.ref(modules[areas[0]]['local']).set({
                  status: r.content.toLowerCase() === 'on' ? true : false,
                  channel: null,
                  message: null
                })

                this.respond(t(`commands:config:${areas[0]}:submodules:${areas[1]}.sucess`, {
                  status: r.content.toLowerCase()
                }))
              } else {
                await this.client.database.ref(modules[areas[0]]['local']).set({
                  status: r.content.toLowerCase() === 'on' ? true : false,
                  channel: ref.val().channel ? ref.val().channel : null,
                  message: ref.val().message ? ref.val().message : null
                })

                this.respond(t(`commands:config:${areas[0]}:submodules:${areas[1]}.sucess`, {
                  status: r.content.toLowerCase()
                }))
              }
            }
          } else {
            return message.channel.send(t('commands:config.statusError'))
          }
        }
      })
    }
  }
}

module.exports = Configuration;