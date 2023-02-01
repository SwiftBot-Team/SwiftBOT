const Base = require("../../services/Command");
const { rightArithShift } = require("mathjs");

class Antiinvite extends Base {
    constructor(client) {
        super(client, {
            name: "antiinvite",
            cooldown: 1000,
            aliases: [],
            permissions: ["MANAGE_GUILD"],
            category: "categories:config",
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return message.respond(t('commands:antiinvite.noArgs', { member: message.author.id, prefix }));

        const ref = await this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}`).once('value');

        if (['disable', 'desabilitar', 'desativar', 'off', 'turn-off'].includes(args[0].toLowerCase())) {

            if (!ref.val() || !ref.val().stats) return message.respond(t('commands:antiinvite.isDisabled', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}/stats`).set(false);

            return message.respond(t('commands:antiinvite.disabled', { member: message.author.id }))
        }

        if (['enable', 'on', 'turn-on', 'ligar', 'ativar'].includes(args[0].toLowerCase())) {

            if (ref.val() && ref.val().stats) return message.respond(t('commands:antiinvite.isEnabled', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}/stats`).set(true);

            return message.respond(t('commands:antiinvite.enabled', { member: message.author.id }));

        }

        if (['stats', 'status', 'info'].includes(args[0].toLowerCase())) {
            const embed = new this.client.embed()
                .setAuthor(t('commands:antiinvite:status.author'), this.client.user.displayAvatarURL())
                .setDescription(`${t('commands:antiinvite:status.description', { status: ref.val() ? ref.val().stats ? 'ativo' : 'desativado' : 'desativado' })}
                
                **${ref.val() ?
                        ref.val().permissions ?
                            Object.values(ref.val().permissions).map((id, i) =>
                                `${i + 1} - ${message.guild.members.cache.get(id.id) || message.guild.channels.cache.get(id.id) || message.guild.roles.cache.get(id.id) || `Não encontrado - ID: ${id}`}`).join("\n")
                            : 'Nenhum' :
                        'Nenhum'}**`);

            await message.channel.send(embed)
        }

        if (['addperm', 'add', 'addpermissão', 'adicionar', 'adicionarpermissão'].includes(args[0].toLowerCase())) {

            if (!ref.val()) return message.respond(t('commands:antiinvite.noStarted', { member: message.author.id }));

            if (!args[1]) return message.respond(t('commands:antiinvite.noArgs1', { member: message.author.id }));

            const perm = message.mentions.members.first() || message.mentions.channels.first() || message.mentions.roles.first() || message.guild.members.cache.get(args[1]) || message.guild.channels.cache.get(args[1]) || message.guild.roles.cache.get(args[1]);

            if (!perm) return message.respond(t('commands:antiinvite.noPermFound', { member: message.author.id }));

            message.respond(t('commands:antiinvite.added', { member: message.author.id }));

            if (!ref.val().permissions) {
                this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}/permissions/${perm.id}`).set({
                    id: perm.id
                })
            } else {
                this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}/permissions/${perm.id}`).set({
                    id: perm.id
                })
            }
        }

        if (['removeperm', 'remove', 'removerpermissão', 'remover', 'removerpermissão'].includes(args[0].toLowerCase())) {

            if (!ref.val()) return message.respond(t('commands:antiinvite.noStarted', { member: message.author.id }));

            if (!args[1]) return message.respond(t('commands:antiinvite.noArgs1', { member: message.author.id }));

            const perm = message.mentions.members.first() || message.mentions.channels.first() || message.mentions.roles.first() || message.guild.members.cache.get(args[1]) || message.guild.channels.cache.get(args[1]) || message.guild.roles.cache.get(args[1]);

            if (!perm) return message.respond(t('commands:antiinvite.noPermFound', { member: message.author.id }));

            if (!ref.val().permissions || !Object.values(ref.val().permissions).find(r => r.id === perm.id)) return message.respond(t('commands:antiinvite.noInsertRole', { member: message.author.id }))

            message.respond(t('commands:antiinvite.removed', { member: message.author.id }));


            this.client.database.ref(`SwiftBOT/config/antiinvite/${message.guild.id}/permissions/${perm.id}`).remove();

        }
    }
}

module.exports = Antiinvite;