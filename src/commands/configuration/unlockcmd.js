const Base = require("../../services/Command");

class Unlockcmd extends Base {
    constructor(client) {
        super(client, {
            name: "unlockcmd",
            cooldown: 1000,
            aliases: ["desbloquearcomando", 'unlockcommand', 'desbloquear-comando'],
            permissions: ["MANAGE_GUILD"],
            usage: 'usages:prefixo',
            category: "categories:config",
            description: "descriptions:unlockcmd"
        });
    }

    async run({ message, args, prefix }, t) {
        const toLock = args[0];

        if (!toLock) return this.respond(t('commands:unlockcmd.noArgs', { member: message.author.id }));

        const cmd = this.client.commands.filter(c => !c.conf.devsOnly && c.help.name.toLowerCase() === toLock.toLowerCase() && c.help.category !== 'categories:devs' || t(c.help.category).toLowerCase() === toLock.toLowerCase()) || this.client.commands.map(c => t(c.help.category)).filter(c => c.toLowerCase() === toLock.toLowerCase());

        if (!cmd[0] && !['*', 'all', 'todos'].includes(toLock.toLowerCase())) return this.respond(t('commands:unlockcmd.noFound', { member: message.author.id }));

        if (['*', 'all', 'todos'].includes(toLock.toLowerCase())) {

            this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).remove();

            return this.respond(t('commands:unlockcmd.allUnlocked'));
        }

        const categories = this.client.commands.map(c => t(c.help.category)).filter((v, i, a) => a.indexOf(v) === i).map(c => c.toLowerCase());

        if (categories.includes(toLock.toLowerCase())) {
            const commands = cmd.map(c => c.help.name.toLowerCase());

            const ref = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).once('value');

            const atual = ref.val() ? [...ref.val().filter(c => !commands.includes(c))] : [];

            this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).set(atual);

            return this.respond(t('commands:unlockcmd.categoryUnlocked', { categoria: toLock }));

        }

        const ref = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).once('value');

        const atual = ref.val() ? [...ref.val().filter(c => c !== cmd[0].help.name.toLowerCase())] : [cmd[0].help.name.toLowerCase()];

        this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).set(atual);

        return this.respond(t('commands:unlockcmd.oneUnlocked', { comando: toLock }));
    }
}

module.exports = Unlockcmd;