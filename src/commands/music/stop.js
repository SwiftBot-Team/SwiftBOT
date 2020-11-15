const Base = require("../../services/Command");

module.exports = class Stop extends Base {
    constructor(client) {
        super(client, {
            name: 'stop',
            aliases: ['parar'],
            category: "categories:music",
            requiresChannel: true
        })
    }

    async run({ message, args }, t) {

        const player = this.client.music.players.get(message.guild.id);

        player.destroy();

        message.react('👍');
    }
}