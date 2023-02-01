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
            requiresChannel: true,
            slash: true
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (!player.paused) {
            player.queue.current.pausedStartAt = Date.now();
        }

        player.pause(true)

        return message.respond('Pausado com sucesso.!')
    }
}
module.exports = pause