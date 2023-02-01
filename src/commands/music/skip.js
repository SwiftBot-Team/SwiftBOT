const Base = require("../../services/Command");

module.exports = class Skip extends Base {
    constructor(client) {
        super(client, {
            name: 'skip',
            aliases: ['pular', 's'],
            category: "categories:music",
            description: 'descriptions:skip',
            requiresChannel: true,
            requiresPlayer: true,
            slash: true
        })
    }

    async run({ message, args }, t) {
        const player = this.client.music.players.get(message.guild.id);

        await player.stop(true);

        return message.respond(t('commands:skip.sucess'))
    }
}