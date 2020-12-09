const Base = require("../../services/Command");

module.exports = class Loop extends Base {
    constructor(client) {
        super(client, {
            name: 'loop',
            aliases: ['lp', 'loopqueue'],
            category: "categories:music",
            requiresChannel: true

        })
    }

    async run({ message, args }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (player.queueRepeat) {
            player.setQueueRepeat(false)
            return this.respond(t('commands:loop.disable'));

        } else {
            player.setQueueRepeat(true)
            return this.respond(t('commands:loop.enable'));
        }
    }
}