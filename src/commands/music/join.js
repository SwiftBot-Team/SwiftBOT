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
            requiresChannel: true
        })
    }

    async run({ message, args, prefix }, t) {

        message.member.voice.channel.join();

        await message.react('👍');
    }
}
module.exports = join