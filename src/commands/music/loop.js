const Base = require("../../services/Command");

module.exports = class Loop extends Base {
    constructor(client) {
        super(client, {
            name: 'loop',
            aliases: ['lp', 'loopqueue'],
            category: "categories:music",
        })
    }

    async run({ message, args }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (player.looped === 1 || player.looped === 2) {
            player.loop(0)
            return this.respond(t('commands:loop.disable'));

        } else {
            player.loop(2);
            return this.respond(t('commands:loop.enable'));
        }
    }
}