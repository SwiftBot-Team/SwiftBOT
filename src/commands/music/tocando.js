const Base = require("../../services/Command");

class tocando extends Base {
    constructor(client) {
        super(client, {
            name: "tocando",
            description: "descriptions:tocando",
            category: "categories:music",
            usage: "usages:tocando",
            cooldown: 1000,
            aliases: [],
            requiresChannel: false
        })
    }

    async run({ message, args, prefix, player }, t) {

        if (!player) return this.respond('n to tocando nada moço')

        this.respond(t('commands:tocando.tocando', {
            title: player.queue[0].info.title,
            url: player.queue[0].info.uri,
            member: message.author.id
        }))

    }
}
module.exports = tocando