const Guild = require('../database/models/Guild');

const { v4 } = require('uuid')
const { msToTime, convertHourToMinutes } = require('../utils/index')

let t;

module.exports = class {
    constructor(client) {
        this.client = client;
        this.name = 'message'
    }
    async run(message) {

        if (message.channel.type == 'dm') return;
        if (message.author.bot) return;

        const prefix = await this.client.getPrefix(message.guild);

        if (message.mentions.users.first() !== this.client.user && !message.content.startsWith(prefix)) return;

        // message.channel.send = (content, options, id = message.id) => {

        //     return message.quote(content, (typeof options === 'object' ? options : id), id)
        // }

        // message.reply = (content, options, id = message.id) => {

        //     return message.quote(`${message.author} ` + content, (typeof options === 'object' ? options : id), id)
        // }

        let args = message.content.split(/\s+/g);

        let command;

        let cmd;

        if ([this.client.user.toString(), '<@!577139966379819044>'].includes(args[0])) {

            if (!args[1]) return message.channel.send(new this.client.embed().setDescription(`👋 Olá, ${message.member}. Para utilizar meus comandos, use ${this.client.user.toString()} <comando>. \n\n Caso tenha alguma dúvida, use o comando ${this.client.user.toString()} ajuda. `))
            args = args.slice(1);

            command = args[0].replace(String(prefix), '').toLowerCase();

            cmd = this.client.commands.find(c => c.help.name.toLowerCase() === command || (c.conf.aliases && c.conf.aliases.includes(command)));

            if (cmd) args.shift();

            if (!cmd) {
                /* try {
                    message.channel.startTyping();

                    const context = this.client.context.get(message.author.id) || [];

                    const answer = await (require('cleverbot-free')(args.join(" "), context));

                    if (!this.client.context.get(message.author.id)) this.client.context.set(message.author.id, [args.join(" "), answer.replace(/(clever|Clever)/gi, 'Swift')]);
                    else this.client.context.get(message.author.id).push(args.join(" "), answer.replace(/(clever|Clever)/gi, 'Swift'));

                    message.channel.stopTyping();

                    return message.quote(answer.replace(/(clever|Clever)/gi, 'Swift'));
                } catch (err) {
                    message.channel.stopTyping();

                    return message.quote('Ocorreu um erro, por favor, tente falar comigo novamente.');
                } */
            } else {
                ['users', 'members'].map(k => {
                    if (!message.mentions[k] || !message.mentions[k].first()) return;

                    message.mentions[k].delete(message.mentions[k].first().id)
                })
            }

        } else if (message.reference && this.client.context.get(message.author.id) && this.client.context.get(message.author.id).includes(message.channel.messages.cache.get(message.reference.messageID).content)) {

            /* try {
                message.channel.startTyping();

                const context = this.client.context.get(message.author.id) || [];

                const answer = await (require('cleverbot-free')(args.join(" "), context));

                if (!this.client.context.get(message.author.id)) this.client.context.set(message.author.id, [args.join(" "), answer.replace(/(clever|Clever)/gi, 'Swift')]);
                else this.client.context.get(message.author.id).push(args.join(" "), answer.replace(/(clever|Clever)/gi, 'Swift'));

                message.channel.stopTyping();

                return message.quote(answer.replace(/(clever|Clever)/gi, 'Swift'));
            } catch (err) {
                message.channel.stopTyping();

                return message.quote('Ocorreu um erro, por favor, tente falar comigo novamente.');
            } */

        } else {
            command = args.shift().replace(String(prefix), '').toLowerCase();
            cmd = this.client.commands.find(c => c.help.name.toLowerCase() === command || (c.conf.aliases && c.conf.aliases.includes(command)));
        }

        const language = await this.client.getLanguage(message.guild.id);

        try {
            t = await this.client.getTranslate(message.guild.id);

        } catch (e) {
            console.log(e);
        }

        const Embed = new this.client.embed(message.author);

        if (!cmd) return;

        if (cmd.cooldown.get(message.author.id)) {
            return message.channel.send(Embed.setDescription(t('errors:cooldownError', { cooldown: Math.floor((cmd.cooldown.get(message.author.id) - Date.now()) / 1000) > 1 ? Math.floor((cmd.cooldown.get(message.author.id) - Date.now()) / 1000) : 'alguns' })))
        }

        const lockedCmds = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/lockedcmds`).once('value');

        if (lockedCmds.val() && lockedCmds.val().includes(cmd.help.name) && !['lockcmd', 'unlockcmd'].includes(cmd.help.name) && !message.member.permissions.has('MANAGE_GUILD')) return message.channel.send(new this.client.embed().setDescription(t('utils:lockedcmd', { member: message.author.id }))).then(msg => msg.delete({ timeout: 7000 }));


        cmd.setMessage(message, args);

        const verify = await cmd.verifyRequirementes(t)
        if (verify) return

        const action = [
            {
                name: message.author.username,
                id: message.author.id,
                display: message.author.displayAvatarURL()
            },
            {
                name: message.guild.name,
                id: message.guild.id
            },
            {
                uuid: v4(),
                time: convertHourToMinutes(msToTime(Date.now())),
                cmd,
                args
            }
        ]
        const player = this.client.music.players.get(message.guild.id);

        const games = this.client.games;

        this.client.usedCommands++

        cmd.run({ message, args, prefix, language, player, games, member: message.author.id, tts: this.client.tts.get(message.guild.id) }, t);

        this.client.instance.log('COMMAND_EXECUTED', action)

        if (cmd.conf.cooldown > 0) cmd.startCooldown(message.author.id);
    }
};
