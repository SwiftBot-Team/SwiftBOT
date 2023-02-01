const Base = require("../../services/Command");

class join extends Base {
    constructor(client) {
        super(client, {
            name: "join",
            description: "descriptions:join",
            category: "categories:music",
            usage: "usages:join",
            cooldown: 1000,
            aliases: [],
            requiresChannel: true,
            slash: true
        })
    }

    async run({ message, args, prefix }, t) {

        message.member.voice.channel.join();

        return message.respond('Entrando no canal de voz...')
    }
}
module.exports = join