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
            requiresChannel: true,
            requiresPlayer: true,
            slash: true
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (!player.paused) return message.respond(t('commands:resume.isPlaying', { member: message.author.id }));

        player.queue.current.pausedTime += Date.now() - player.queue.current.pausedStartAt;

        player.pause(false);

        message.react('👍');
    }
}
module.exports = resume