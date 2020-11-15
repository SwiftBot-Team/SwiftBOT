const Base = require("../../services/Command");

class Kick extends Base {
    constructor(client) {
        super(client, {
            name: "kick",
            description: "descriptions:kick",
            category: "categories:mod",
            usage: "usages:kick",
            cooldown: 1000,
            aliases: ['expulsar', 'kickar'],
            permissions: ['KICK_MEMBERS'],
            bot_permissions: ['KICK_MEMBERS']
        })
    }
    async run({ message, args, prefix }, t) {

        if (!args[0] || !args[1])
            return this.respond(t('commands:kick.noArgs', { member: message.author.id }));

        const user = await this.getUsers();

        if (!user[0])
            return this.respond(t('commands:kick.noUser', { member: message.author.id }));

        if (!user[0].kickable)
            return this.respond(t('commands:kick.nokicknable', { member: message.author.id, user: user[0].id }));

        const time = ms(args[1]);

        if (!time)
            return this.respond(t('commands:kick.noTime', { member: message.author.id }));

        const reason = args[2] ? args.slice(2).join(" ") : t('commands:kick.reason', { member: message.author.tag });

        user[0].kick({ reason: reason }).then(() => {
            this.respond(t('commands:kick.sucess', { member: message.author.id }));

            this.client.emit('guildKickAdd', { member: user[0].id, autor: message.author.id, reason: reason });

        }).catch(() => {
            this.respond(t('commands:kick.fail', { member: message.author.id }));
        })

    }
}

module.exports = Kick