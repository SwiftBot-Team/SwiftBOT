const Base = require("../../services/Command");

class Ban extends Base {
    constructor(client) {
        super(client, {
            name: "ban",
            description: "descriptions:ban",
            category: "categories:mod",
            usage: "usages:ban",
            cooldown: 1000,
            aliases: ['banir', 'forceban'],
            permissions: ['BAN_MEMBERS'],
            bot_permissions: ['BAN_MEMBERS']
        })
    }
    async run({ message, args, prefix }, t) {

        if (!args[0])
            return this.respond(t('commands:ban.noArgs', { member: message.author.id }));

        const user = await this.getUsers();

        if (!user[0])
            return this.respond(t('commands:ban.noUser', { member: message.author.id }));

        if (!user[0].bannable)
            return this.respond(t('commands:ban.noBannable', { member: message.author.id, user: user[0].id }));

        const reason = args[1] ? t('commands:ban.hasReason', { reason: args.slice(1).join(" "), member: message.author.tag }) : t('commands:ban.reason');

        user[0].ban({ reason: reason }).then(() => {
            this.respond(t('commands:ban.sucess', { member: message.author.id }));

            this.client.emit('guildBanAdd', { member: user[0].id, autor: message.author.id, reason: reason });
        }).catch(() => {
            this.respond(t('commands:ban.fail', { member: message.author.id }));
        })

    }
}

module.exports = Ban