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
    async run({ message, args, prefix, member }, t) {

        if (!args[0])
            return message.respond(t('commands:ban.noArgs', { member: message.author.id }));

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => (m.username || m.user.username) === args[0])

        if (!user)
            return message.respond(t('commands:ban.noUser', { member: message.author.id }));

        if (!user.bannable)
            return message.respond(t('commands:ban.noBannable', { member: message.author.id, user: user.id }));

        const reason = args[1] ? t('commands:ban.hasReason', { reason: args.slice(1).join(" "), member: message.author.tag }) : t('commands:ban.reason');

        user.ban({ reason: reason }).then(() => {
            message.respond(t('commands:ban.sucess', { member: message.author.id }));

            this.client.emit('guildBanAdd', { member: user.id, autor: message.author.id, reason: reason });
        }).catch(() => {
            message.respond(t('commands:ban.fail', { member: message.author.id }));
        })

    }
}

module.exports = Ban