const Base = require("../../services/Command");
const Ranks = require('../../utils/Ranks')

function codeblock(
    language,
    code
) {
    return `\`\`\`${language}\n${code}\`\`\``;
}

class Rank extends Base {
  constructor(client) {
    super(client, {
      name: "rank",
      description: "descriptions:rank",
      category: "categories:economy",
      usage: "usages:rank",
      cooldown: 1000,
      aliases: ['ver-rank']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const user = this.getUsers()[0] || message.member,
        money = this.client.controllers.money,
        ranks = Object.values(Ranks)

    let rank = ranks[await money.getRank(user.id)],
        proxRank = ranks[await money.getRank(user.id)+1] ? ranks[await money.getRank(user.id)+1] : null,
        coins = await money.getBalance(user.id),
        length = 10

    const parts = Math.floor(proxRank ? proxRank.costs/length : length),
        amount = Math.floor((coins/parts === Infinity ? 10 : coins/parts))

    const progressBar = this.progressBar(amount > 10 ? 10 : amount, length)
    const Embed = new this.client.embed()
        .setAuthor(user.user.username+` [Rank ${await money.getRank(user.id)}]`, rank.emote)
        .setDescription(codeblock('css', `${await money.getRank(user.id)} [ ${progressBar} ] ${proxRank ? await money.getRank(user.id)+1 : '*'}`))
        .addField(t('commands:rank.costs'), `\`${proxRank ? proxRank.costs : '*'} sCoins\`  \n⠀`)  
        .addField(t('commands:rank.t'), 
            `\`${t('commands:rank.inteligence')}: ${proxRank ? proxRank.inteligence : 'X'}\`\n\`${t('commands:rank.tax')}: ${String(proxRank ? proxRank.tax : '0.0X')[3]}%\``
        )  
        .addField(t('commands:rank.t2'), 
        `\`${t('commands:rank.inteligence')}: ${rank.inteligence}\`\n\`${t('commands:rank.tax')}: ${String(rank ? rank.tax : '0.0X')[3]}%\``
        )
        .setTimestamp()
        .setThumbnail(user.user.displayAvatarURL())
    
    message.channel.send(Embed)
  }
}
module.exports = Rank