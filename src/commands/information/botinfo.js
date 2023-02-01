const Base = require("../../services/Command");
const { convertMS } = require("../../utils")

class BotInfo extends Base {
  constructor(client) {
    super(client, {
      name: "botinfo",
      description: "descriptions:botinfo",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["bi", "infobot"]
    });
  }

  async run({ message, args, prefix }, t) {

    const os = require('os');

    let u = convertMS(this.client.uptime);

    let ontime = `${u.d}` + " Dia(s), " + `${u.h}` + " Hora(s), " + `${u.m}` + " Minutos, " + `${u.s}` + " Segundos"

    const Embed = new this.client.embed(message.author)

    Embed
      .setDescription('<a:Loading:745327497096331314>')
      .setFooter('', '')
      .setColor('#36393f')

    let msg = await message.respond(Embed);

    setTimeout(() => {
      Embed
        .setAuthor(t('commands:botinfo.title'), this.client.user.displayAvatarURL())
        .setDescriptionFromBlockArray([
          [
            `${this.getEmoji('swiftlove')} ` + t('commands:botinfo.description-header')
            + '\n\n ⠀'
          ]
        ])

        .addField(t('commands:botinfo:stats.title'),
          `${t('commands:botinfo:stats.1', { var: this.client.guilds.cache.size })}\n` +
          `${t('commands:botinfo:stats.2', { var: this.client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a+b, 0) })}\n` +
          `${t('commands:botinfo:stats.3', { var: this.client.commands.length })}\n` +
          `${t('commands:botinfo:stats.4', { var: this.client.channels.cache.size })}\n` +
          `${t('commands:botinfo:stats.5', { var: this.client.usedCommands })}\n⠀` +
          ` `
        )

        .addField(t('commands:botinfo:host.title'),
          `${t('commands:botinfo:host.1', { var: `${os.cpus()[0].model} ${os.cpus().length} vCore` })}\n` +
          `${t('commands:botinfo:host.2', { var: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}/${(os.totalmem() / 1024 / 1024).toFixed(0)} ` })}\n` +
          `${t('commands:botinfo:host.3', { var: os.loadavg()[0] })}\n` +
          `⠀`,
        )
        .addField(t('commands:botinfo:infos.title'),
          `${t('commands:botinfo:infos.1')}\n` +
          `${t('commands:botinfo:infos.2')}\n` +
          `${t('commands:botinfo:infos.3')}\n  ⠀` +
          `⠀`,
        )
        .addField(t('commands:botinfo:status.title'),
          `${t('commands:botinfo:status.1', { var: ontime })}\n  ⠀`
        )
        .setThumbnail(this.client.user.displayAvatarURL())
        .setColor('#36393f')

      msg.edit({ embed: Embed })
    }, 3000)

  }
}

module.exports = BotInfo;
