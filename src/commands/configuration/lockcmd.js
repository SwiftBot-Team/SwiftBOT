const Base = require("../../services/Command");

class Lockcmd extends Base {
    constructor(client) {
        super(client, {
            name: "lockcmd",
            cooldown: 1000,
            aliases: ["bloquearcomando", 'lockcommand', 'bloquear-comando'],
            permissions: ["MANAGE_GUILD"],
            usage: 'usages:prefixo',
            category: "categories:config",
            description: "descriptions:lockcmd"
        });
    }

    async run({ message, args, prefix }, t) {
        const toLock = args[0];

        if (!toLock) return message.respond(t('commands:lockcmd.noArgs', { member: message.author.id }));

        const cmd = this.client.commands.filter(c => !c.conf.devsOnly && c.help.name.toLowerCase() === toLock.toLowerCase() && c.help.category !== 'categories:devs' || t(c.help.category).toLowerCase() === toLock.toLowerCase()) || this.client.commands.map(c => t(c.help.category)).filter(c => c.toLowerCase() === toLock.toLowerCase());

        if (!cmd[0] && !['*', 'all', 'todos'].includes(toLock.toLowerCase())) return message.respond(t('commands:lockcmd.noFound', { member: message.author.id }));

        if (['*', 'all', 'todos'].includes(toLock.toLowerCase())) {
            const commands = this.client.commands.filter(c => !c.conf.devsOnly).map(c => c.help.name);

            this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).set(commands);

            return message.respond(t('commands:lockcmd.allLocked'));
        }

        const categories = this.client.commands.map(c => t(c.help.category)).filter((v, i, a) => a.indexOf(v) === i).map(c => c.toLowerCase());

        if (categories.includes(toLock.toLowerCase())) {
            const commands = cmd.map(c => c.help.name.toLowerCase())

            const ref = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).once('value');

            const atual = ref.val() ? [...ref.val(), ...commands] : commands;

            this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).set(atual);

            return message.respond(t('commands:lockcmd.categoryLocked', { categoria: toLock }));

        }

        const ref = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).once('value');

        const atual = ref.val() ? [...ref.val(), cmd[0].help.name.toLowerCase()] : [cmd[0].help.name.toLowerCase()];

        this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).set(atual);

        return message.respond(t('commands:lockcmd.oneLocked', { comando: toLock }));
    }
}

module.exports = Lockcmd;