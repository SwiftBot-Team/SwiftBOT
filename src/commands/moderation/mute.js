const Base = require("../../services/Command");

const ms = require('ms');

module.exports = class Mute extends Base {
    constructor(client) {
        super(client, {
            name: 'mute',
            aliases: ['silenciar', 'silence', 'mutar'],
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

        if (!args[0]) return this.respond(t('commands:mute.noArgs0', { member, prefix }));

        const user = await this.getUsers()[0];

        if (!user) return this.respond(t('commands:mute.noUser', { member }));

        if (!user.manageable) return this.respond(t('commands:mute.noManageable', { member }));

        if (!args[1] && !message.member.permissions.has('MANAGE_GUILD')) return this.respond(t('commands:mute.noReason', { member, prefix }));

        const reason = args[1] ? `Mutado por ${message.author.tag} - Motivo: ${args.slice(1).join(" ")}` : `Mutado por ${message.author.tag} - Motivo: Não informado`

        const sendMessage = await this.respond(t('commands:mute.whatTime', { member }), false, {
            footer: t('utils:operationCancel')
        });

        const collector = sendMessage.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

            .on('collect', async ({ content }) => {
                if (['cancel', 'cancelar'].includes(content.toLowerCase())) {

                    collector.stop();

                    return this.respond(t('utils:operationCanceled', { member }));
                }

                let time = ms(content);

                if (!time) return this.respond(t('commands:mute.invalidTime', { member }), false, {
                    footer: t('utils:operationCancel')
                });

                this.respond(t('commands:mute.sucess'));

                collector.stop();

                time += Date.now();

                this.client.database.ref(`SwiftBOT/mutados/${message.guild.id}/${user.id}`).set({
                    role: role.id,
                    time,
                    autor: message.author.id,
                    reason: reason,
                    guild: message.guild.id,
                    user: user.id
                });

                user.roles.add(role.id, reason);

                setTimeout(async () => {

                    const ref = await this.client.database.ref(`SwiftBOT/mutados/${message.guild.id}/${user.id}`).once('value');

                    if (!ref.val() || Date.now() < ref.val().time) return;

                    user.roles.remove(role.id, 'Usuário desmutado automaticamente');

                    this.client.database.ref(`SwiftBOT/mutados/${message.guild.id}/${user.id}`).remove();

                }, ms(content) >= 2332800000 ? 2332800000 : ms(content));

            })
    }
}