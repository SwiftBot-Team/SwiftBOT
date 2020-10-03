const Base = require("../../services/Command");

class seek extends Base {
    constructor(client) {
        super(client, {
            name: "seek",
            description: "descriptions:seek",
            category: "categories:music",
            usage: "usages:seek",
            cooldown: 1000,
            aliases: []
        })
    }

    async run({ message, args, prefix }, t) {

        const player = this.client.music.players.get(message.guild.id);

        if (!args[0]) return this.respond(t('commands:seek.noArgs', { member: message.author.id }));

        const seekSplit = args[0].split(':');

        if (!seekSplit.length || seekSplit.lenght === 1) return this.respond(t('commands:seek.invalidTime', { member: message.author.id }));

        if (seekSplit.length > 3) return this.respond(t('commands:seek.limit', { member: message.author.id }));
        if (seekSplit.some(number => isNaN(number))) return this.respond(t('commands:seek.invalidTime', { member: message.author.id }));

        let hours = 0, minutes = 0, seconds = 0;

        if (seekSplit.length === 3) {
            hours = seekSplit[0] * 60 * 60 * 1000;
            minutes = seekSplit[1] * 60 * 1000;
            seconds = seekSplit[2] * 1000;
        } else {
            minutes = seekSplit[0] * 60 * 1000;
            seconds = seekSplit[1] * 1000;
        };

        player.seek(hours + minutes + seconds);

        await message.react("👍");
    }
}
module.exports = seek
