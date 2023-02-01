const Base = require("../../services/Command");

module.exports = class Tocando extends Base {
    constructor(client) {
        super(client, {
            name: 'volume',
            aliases: ['v', 'vol'],
            category: "categories:music",
            requiresChannel: true,
            description: 'descriptions:volume',
            options: [{
                name: 'volume',
                required: true,
                type: 4,
                description: 'Value to set'
            }]
        })
    }

    async run({ message, args }, t) {


        if (!args[0]) return this.respond(t('commands:volume.noArgs', { member: message.author.id }));
        if (isNaN(args[0]) || Number(args[0]) < 1 || Number(args[0]) > 200) return this.respond(t('commands:volume.invalidNumber', { member: message.author.id }));

        const player = this.client.music.players.get(message.guild.id);

        await player.setVolume(args[0]);

        return message.quote(t('commands:volume.finish', { volume: args[0] }));


    }
}