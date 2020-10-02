const Base = require("../../services/Command");

class pause extends Base {
    constructor(client) {
        super(client, {
            name: "pause",
            description: "descriptions:pause",
            category: "categories:music",
            usage: "usages:pause",
            cooldown: 1000,
            aliases: []
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (player.paused === false) {
            player.pause(true);
            this.respond(t('commands:pause.pause'));
        } else {
            player.pause(false);
            this.respond(t('commands:pause.resume'));
        };

        message.react('👍');
    }
}
module.exports = pause