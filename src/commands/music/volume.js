const Base = require("../../services/Command");

module.exports = class Stop extends Base {
    constructor(client) {
        super(client, {
            name: 'volume',
            aliases: ['v', 'vol'],
            category: "categories:music",
            requiresChannel: true
        })
    }

    async run({ message, args }, t) {


        if (!args[0]) return this.respond(t('commands:volume.noArgs', { member: message.author.id }));
        if (isNaN(args[0]) || Number(args[0]) < 1 || Number(args[0]) > 200) return this.respond(t('commands:volume.invalidNumber', { member: message.author.id }));

        const player = this.client.music.players.get(message.guild.id);

        await player.setVolume(args[0]);

        await this.respond(t('commands:volume.finish', { volume: args[0] }));

        message.react('👍');


    }
}