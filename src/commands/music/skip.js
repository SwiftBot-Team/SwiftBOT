const Base = require("../../services/Command");

module.exports = class Skip extends Base {
    constructor(client) {
        super(client, {
            name: 'skip',
            aliases: ['pular', 's'],
            category: "categories:music",
        })
    }

    async run({ message, args }, t) {
        const player = this.client.music.players.get(message.guild.id);

        await player.stop(true);

        await message.react('👍');
    }
}