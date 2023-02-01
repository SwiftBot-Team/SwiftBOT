const Base = require("../../services/Command");

module.exports = class Stop extends Base {
    constructor(client) {
        super(client, {
            name: 'stop',
            aliases: ['parar'],
            category: "categories:music",
            requiresChannel: true,
            description: 'descriptions:stop',
            slash: true
        })
    }

    async run({ message, args, player }, t) {

        if (player.autoPlay && player.autoPlayTimeout) clearInterval(player.autoPlayTimeout);

        player.destroy();

        message.react('👍');
    }
}