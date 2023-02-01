const Base = require("../../services/Command");
const Discord = require('discord.js')

const moment = require('moment')

class UserInfo extends Base {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "descriptions:userinfo",
      usage: "usages:userinfo",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["ui", "user"]
    });
  }

  async run({ message, args, prefix, language }, t) {
    moment.locale(language)

    function checkDays(date) {
      return date + (date == 1 ? ` ${t('utils:day')}` : ` ${t('utils:days')}`);
    };

    const user = (this.getUsers()[0] ? this.getUsers()[0].user : null) || message.author
    const member = message.guild.members.cache.get(user.id)

    const account_createdAt = moment(user.createdTimestamp).format('lll');
    const account_created = moment.duration(message.createdTimestamp - user.createdTimestamp).asDays()

    const joinedAt = moment(user.joinedTimestamp).format('lll')
    const joined = moment.duration(message.createdTimestamp - member.joinedTimestamp).asDays()

    const embed = new this.client.embed()
      .setAuthor(user.username, user.displayAvatarURL())
      .setTimestamp()
      .addField(t('commands:userinfo.infos'), 
        `・ TAG: \`${user.tag}\` \n`
        + `・ ID: \`${user.id}\` \n⠀`
      )
      .addField(':date: ' + t('commands:userinfo.dates'),
        `・ ${t('commands:userinfo.created')} ${account_createdAt} (${checkDays(Math.floor(account_created))}) \n`
        + `・ ${t('commands:userinfo.ijoined')} ${joinedAt} (${checkDays(Math.floor(joined))}) \n⠀`
      )
      .addField(t('commands:userinfo.roles'), `・ ${member.roles.cache.filter(r => r.name != "@everyone").map(r => r).join(' ')}`)
    await message.channel.send(embed)
  }
}

module.exports = UserInfo;