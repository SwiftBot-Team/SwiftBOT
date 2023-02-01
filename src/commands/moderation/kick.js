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
            return message.respond(t('commands:kick.noArgs', { member: message.author.id }));

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => (m.username || m.user.username) === args[0])

        if (!user)
            return message.respond(t('commands:kick.noUser', { member: message.author.id }));

        if (!user.kickable)
            return message.respond(t('commands:kick.nokicknable', { member: message.author.id, user: user.id }));

        const time = ms(args[1]);

        if (!time)
            return message.respond(t('commands:kick.noTime', { member: message.author.id }));

        const reason = args[2] ? args.slice(2).join(" ") : t('commands:kick.reason', { member: message.author.tag });

        user.kick({ reason: reason }).then(() => {
            message.respond(t('commands:kick.sucess', { member: message.author.id }));

            this.client.emit('guildKickAdd', { member: user.id, autor: message.author.id, reason: reason });

        }).catch(() => {
            message.respond(t('commands:kick.fail', { member: message.author.id }));
        })

    }
}

module.exports = Kick