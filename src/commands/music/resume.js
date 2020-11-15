const Base = require("../../services/Command");

class resume extends Base {
    constructor(client) {
        super(client, {
            name: "resume",
            description: "descriptions:resume",
            category: "categories:music",
            usage: "usages:resume",
            cooldown: 1000,
            aliases: ['unpause', 'retomar'],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (player.paused === false) return this.respond(t('commands:resume.isPlaying', { member: message.author.id }));

        player.pause(false);

        this.respond(t('commands:resume.resume'));
        message.react('👍');
    }
}
module.exports = resume