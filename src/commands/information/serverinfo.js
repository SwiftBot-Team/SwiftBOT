const Base = require("../../services/Command");
const moment = require('moment')
moment.locale('pt-br')

class ServerInfo extends Base {
  constructor(client) {
    super(client, {
      name: "serverinfo",
      description: "descriptions:serverinfo",
      usage: "usages:serverinfo",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["si", "info-server", "guild"]
    });
  }

  run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)

    function checkDays(date) {
      let now = new Date();
      let diff = now.getTime() - date.getTime();
      let days = Math.floor(diff / 86400000);
      return days + (days == 1 ? " dia" : " dias") + " atrás";
    };

    let region = {
      "brazil": ":flag_br: Brazil",
      "eu-central": ":flag_eu: Central Europe",
      "singapore": ":flag_sg: Singapore",
      "us-central": ":flag_us: U.S. Central",
      "sydney": ":flag_au: Sydney",
      "us-east": ":flag_us: U.S. East",
      "us-south": ":flag_us: U.S. South",
      "us-west": ":flag_us: U.S. West",
      "eu-west": ":flag_eu: Western Europe",
      "vip-us-east": ":flag_us: VIP U.S. East",
      "london": ":flag_gb: London",
      "amsterdam": ":flag_nl: Amsterdam",
      "hongkong": ":flag_hk: Hong Kong",
      "russia": ":flag_ru: Russia",
      "southafrica": ":flag_za:  South Africa"
    };

    if (args[0]) {
      let id = args[0]

      const guild = this.client.guilds.cache.get(id)

      if (!guild) return message.channel.send(Embed.setDescription(t('commands:serverinfo.notFound')))

      Embed
        .setAuthor(guild.name + ` (${guild.id})`, guild.iconURL())
        .addField('<:coroa:747236534914121759> **»** ' + t('commands:serverinfo.owner'), '▫️ <@' + guild.owner + '> \n⠀')
        .addField('<a:nitro:747189991486259300> **»** ' + t('commands:serverinfo.nitro'),
          `▫️ ${t('commands:serverinfo.nivel')} : ${guild.premiumTier}`
          + `\n▫️ ${t('commands:serverinfo.impulso')}: ${guild.premiumSubscriptionCount}`
          + '\n⠀'
        )
        .addField('<:region:747192656286974094> **»** ' + t('commands:serverinfo.region'), '▫️ ' + region[guild.region] + ' \n⠀')
        .addField(':date: **»** ' + t('commands:serverinfo.dates'),
          `▫️ ${t('commands:serverinfo.created')}` + `${moment(guild.createdAt).format('LLL')} (${checkDays(message.channel.guild.createdAt)}) \n`
          + `▫️ ${t('commands:serverinfo.ijoined')}: ${moment(guild.me.joinedAt).format('LLL')} (${checkDays(guild.me.joinedAt)})` + '\n⠀'
        )
        .addField('<:coroa:747236534914121759> **»** ' + t('commands:serverinfo.owner'), guild.owner + ' \n⠀')

      message.channel.send(Embed)
    } else {
      const guild = message.guild

      Embed
        .setAuthor(guild.name + ` (${guild.id})`, guild.iconURL())
        .addField('<:coroa:747236534914121759> **»** ' + t('commands:serverinfo.owner'), '▫️ <@' + guild.owner + '> \n⠀')
        .addField('<a:nitro:747189991486259300> **»** ' + t('commands:serverinfo.nitro'),
          `▫️ ${t('commands:serverinfo.nivel')} : ${guild.premiumTier}`
          + `\n▫️ ${t('commands:serverinfo.impulso')}: ${guild.premiumSubscriptionCount}`
          + '\n⠀'
        )
        .addField('<:region:747192656286974094> **»** ' + t('commands:serverinfo.region'), '▫️ ' + region[guild.region] + ' \n⠀')
        .addField(':date: **»** ' + t('commands:serverinfo.dates'),
          `▫️ ${t('commands:serverinfo.created')}` + `${moment(guild.createdAt).format('LLL')} (${checkDays(message.channel.guild.createdAt)}) \n`
          + `▫️ ${t('commands:serverinfo.ijoined')} ${moment(guild.me.joinedAt).format('LLL')} (${checkDays(guild.me.joinedAt)})` + '\n⠀'
        )
        .addField('<:infos:747238192700325988> **»** ' + t('commands:serverinfo.infos'),
          `▫️ ${t('commands:serverinfo.text')} ${guild.channels.cache.filter(c => c.type === 'text').size} \n`
          + `▫️ ${t('commands:serverinfo.voice')} ${guild.channels.cache.filter(c => c.type === 'voice').size} \n`
          + `▫️ ${t('commands:serverinfo.members')} ${guild.members.cache.filter(c => !this.client.users.cache.get(c.id).bot).size}\n`
          + `▫️ ${t('commands:serverinfo.bots')} ${guild.members.cache.filter(c => this.client.users.cache.get(c.id).bot).size}\n`
        )

      message.channel.send(Embed)
    }
  }
}

module.exports = ServerInfo;