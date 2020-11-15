const Base = require("../../services/Command");

class leave extends Base {
    constructor(client) {
        super(client, {
            name: "leave",
            description: "descriptions:leave",
            category: "categories:music",
            usage: "usages:leave",
            cooldown: 1000,
            aliases: [],
            requiresChannel: true
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);
        if (player) await player.destroy();

        if (!player) message.guild.me.voice.channel.leave();

        await message.react('👋');
    }
}
module.exports = leave