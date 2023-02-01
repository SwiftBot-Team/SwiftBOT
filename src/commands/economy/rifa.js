const Base = require("../../services/Command");

module.exports = class Rifa extends Base {
    constructor(client) {
        super(client, {
            name: "rifa",
            description: "descriptions:rifa",
            category: "categories:economy",
            cooldown: 1000,
            aliases: ["swiftrifa"]
        })
    }

    async run({ message, args, prefix }, t) {

        const rifaStats = this.client.controllers.rifa.getStatus();

        if (args[0] && ['comprar', 'buy'].includes(args[0].toLowerCase())) {

            if (!args[1]) return message.respond(t('commands:rifa.noAmount', { member: message.author.id }));

            if (isNaN(args[1]) || Number(args[1]) < 1 || Number(args[1]) > 2500) return message.respond(t('commands:rifa.invalidAmount', { member: message.author.id }));

            if (rifaStats.rifas.filter(r => r.user === message.author.id).length === 2500) return message.respond(t('commands:rifa.maxAmount', { member: message.author.id }));

            if ((await this.client.controllers.money.getBalance(message.author.id)) < 250 * Number(args[1])) return message.respond(t('commands:rifa.noMoney', { member: message.author.id }));

            this.client.controllers.rifa.buy(message.author.id, Number(args[1]));

            return message.respond(t('commands.rifa.buySucess'))
        }

        const lastWinner = await this.client.database.ref(`SwiftBOT/rifa/lastWinner`).once('value').then(db => db.val())

        const embed = new this.client.embed()
            .setAuthor('Swift - Rifa', this.client.user.displayAvatarURL())
            .setDescription(`${t('commands:rifa.embedLastWinner', { lastWinner: lastWinner.tag, value: lastWinner.value })}
            ${t('commands:rifa.peopleIn', { people: rifaStats.users.length })}
            ${t('commands:rifa.alreadAmount', { rifas: rifaStats.rifas.length })}
            ${t('commands:rifa.balance', { balance: rifaStats.acumulado })}
            ${t('commands:rifa.result', { time: await this.client.msToTime(rifaStats.endAt - Date.now()) })}`)
            .setFooter(t('commands:rifa.buyNow', { prefix }));

        return message.channel.send(embed)
    }
}