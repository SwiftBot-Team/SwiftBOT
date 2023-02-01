const Base = require("../../services/Command");

class Streak extends Base {
  constructor(client) {
    super(client, {
      name: "streak",
      description: "descriptions:streak",
      usages: "usages:streak",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["viewstreak"],
      hidden: true
    });
  }

  async run({ message, args, prefix }, t) {
    const user = this.getUsers()[0] || message.member

    if (['daily', 'diario'].includes(args[0].toLowerCase())) {
      const daily = (await this.client.database.ref(`SwiftBOT/users/${user.id}/dailyStreak`).once('value')).val()

      let description = Number(daily) === 10 
        ? '<:streakChecked:821052679475560469>'.repeat(10) 
        : '<:streakChecked:821052679475560469>'.repeat(Number(daily) || 0) + '<:streakUnchecked:821052843015798805>'.repeat(10-(Number(daily) || 0))

      console.log(`SwiftBOT/users/${user.id}/dailyStreak`)
      const Embed = new this.client.embed()
        .setTitle(t('commands:streak.daily')+` (${user.user.username})`)
        .setDescription(description)
        .setFooter(daily === 10 ? `Você já pode pegar o seu premio! Use ${prefix}streak resgatar` : 'Pegue o seu daily 10 vezes para pegar sua recompensa')

      return message.channel.send(Embed)
    }

    if (['vote', 'votes'].includes(args[0].toLowerCase())) {
      const vote = (await this.client.database.ref(`SwiftBOT/users/${user.id}/voteStreak`).once('value')).val()

      let description = Number(vote) === 10 
        ? '<:streakChecked:821052679475560469>'.repeat(10) 
        : '<:streakChecked:821052679475560469>'.repeat(Number(vote) || 0) + '<:streakUnchecked:821052843015798805>'.repeat(10-(Number(vote) || 0))

      console.log(`SwiftBOT/users/${user.id}/voteStreak`)
      const Embed = new this.client.embed()
        .setTitle(t('commands:streak.vote')+` (${user.user.username})`)
        .setDescription(description)
        .setFooter(vote === 10 ? `Você já pode pegar o seu premio! Use ${prefix}streak resgatar` : 'Vote 10 vezes no  bot para pegar sua recompensa')

      return message.channel.send(Embed)
    }

    return message.respond(t('commands:streak.not'))
  }
}

module.exports = Streak;