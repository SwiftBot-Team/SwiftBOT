const Base = require("../../services/Command");

class shuffle extends Base {
    constructor(client) {
        super(client, {
            name: "shuffle",
            description: "descriptions:shuffle",
            category: "categories:music",
            usage: "usages:shuffle",
            cooldown: 5000,
            aliases: ['embaralhar'],
            requiresChannel: true,
            requiresPlayer: true,
            slash: true
        })
    }

    async run({ message, args, prefix, player }, t) {

        player.queue.shuffle();

        return message.respond('<:check:802145617002102794> Playlist embaralhada com sucesso.')
    }
}
module.exports = shuffle
