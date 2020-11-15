const Base = require("../../services/Command");

class Time extends Base {
    constructor(client) {
        super(client, {
            name: "time",
            description: "descriptions:time",
            category: "categories:economy",
            cooldown: 1000,
            aliases: ['hora', 'tempo']
        })
    }

    async run({ message, args, prefix }, t) {
        const time = this.client.controllers.money.day

        message.channel.send(t(`commands:time.${time === 'sun' ? '1' : '2'}`))
    }
}
module.exports = Time