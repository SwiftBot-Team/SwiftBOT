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
            title: player.queue.current.title,
            url: player.queue.current.uri,
            member: message.author.id
        }) +
            `\n\n${await this.converTimePlaying(Date.now() - player.queue.current.startAt - player.queue.current.pausedTime, player.queue.current.duration)}`, true, {
            thumbnail: player.queue.current.thumbnail
        })

    }
}
module.exports = tocando