const Base = require("../../services/Command");

module.exports = class Unmute extends Base {
    constructor(client) {
        super(client, {
            name: 'unmute',
            aliases: ['desmutar'],
            cooldown: 3000,
            category: 'categories:mod',
            bot_permissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
            permissions: ['MUTE_MEMBERS']
        })
    }

    async run({ message, args, member, prefix }, t) {

        let role = message.guild.roles.cache.find(c => c.name === 'Mutado');

        if (!role) role = await message.guild.roles.create({
            data: {
                name: 'Mutado',
                color: 'GRAY'
            }
        }).then(r => {
            message.guild.channels.cache.forEach(c => {
                c.createOverwrite(r, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false,
                    STREAM: false,

                })
            })
        })

        if (!args[0]) return this.respond(t('commands:unmute.noArgs0', { member, prefix }));

        const user = await this.getUsers()[0];

        if (!user) return this.respond(t('commands:unmute.noUser', { member }));

        if (!user.manageable) return this.respond(t('commands:unmute.noManageable', { member }))

        const ref = await this.client.database.ref(`SwiftBOT/mutados/${message.guild.id}/${user.id}`).once('value');

        if (!ref.val()) return this.respond(t('commands:unmute.noMuted', { member }));

        user.roles.remove(role.id, `Usuário desmutado por ${message.author.tag}`).catch(err => err);

        this.respond(t('commands:unmute.sucess'));

        this.client.database.ref(`SwiftBOT/mutados/${message.guild.id}/${user.id}`).remove();
    }
}