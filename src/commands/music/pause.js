const Base = require("../../services/Command");

class pause extends Base {
    constructor(client) {
        super(client, {
            name: "pause",
            description: "descriptions:pause",
            category: "categories:music",
            usage: "usages:pause",
            cooldown: 1000,
            aliases: ['pausar'],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);

        player.pause(true)

        message.react('👍');
    }
}
module.exports = pause