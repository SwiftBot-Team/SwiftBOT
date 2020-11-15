const Base = require("../../services/Command");

const guildDB = require('../../database/models/Guild')

class Prefixo extends Base {
    constructor(client) {
        super(client, {
            name: "prefix",
            cooldown: 1000,
            aliases: ["prefixo", "setprefix"],
            permissions: ["MANAGE_GUILD"],
            usage: 'usages:prefixo',
            category: "categories:config",
            description: "descriptions:prefixo"
        });
    }

    async run({ message, args, prefix }, t) {
        const toLock = args[0];

        if (!toLock) return this.respond(t('commands:lockcmd.noArgs', { member: message.author.id }));

        const cmd = this.client.commands.find(c => c.name.toLowerCase() === toLock.to)
    }
}

module.exports = Prefixo;