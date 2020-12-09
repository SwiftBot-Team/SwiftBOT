const Guild = require('../database/models/Guild');

const { v4 } = require('uuid')
const { msToTime, convertHourToMinutes } = require('../utils/index')

let t;

module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(message) {
        if (message.channel.type == 'dm') return;
        if (message.author.bot) return;
        if (message.mentions.users.first() !== this.client.user && !message.content.startsWith(await this.client.getPrefix(message.guild, Guild))) return

        // message.channel.send = (content, options, id = message.id) => {

        //     return message.quote(content, (typeof options === 'object' ? options : id), id)
        // }

        // message.reply = (content, options, id = message.id) => {

        //     return message.quote(`${message.author} ` + content, (typeof options === 'object' ? options : id), id)
        // }

        const prefix = await this.client.getPrefix(message.guild, Guild);

        let args = message.content.split(/\s+/g);

        if ([this.client.user.toString(), '<@!577139966379819044>'].includes(args[0])) {
            args = args.slice(1);

            Object.keys(message.mentions).map(key => {
                if (!message.mentions[key]) return;

                message.mentions[key].delete([...message.mentions[key].keys()][0])
            })
        }
        const command = args.shift().replace(String(prefix), '').toLowerCase();

        const cmd = this.client.commands.find(c => c.help.name.toLowerCase() === command || (c.conf.aliases && c.conf.aliases.includes(command)));

        if (!cmd) return;

        const language = await this.client.getLanguage(message.guild.id);

        try {
            t = await this.client.getTranslate(message.guild.id)
        } catch (e) {
            console.log(e);
        }

        const Embed = new this.client.embed(message.author)

        if (cmd.cooldown.get(message.author.id)) {
            return message.channel.send(Embed.setDescription('<:errado:739176302317273089> ' + t('errors:cooldownError', { cooldown: Math.floor((cmd.cooldown.get(message.author.id) - Date.now()) / 1000) })))
        }

        const lockedCmds = await this.client.database.ref(`SwiftBOT / Servidores / ${message.guild.id} / lockedcmds`).once('value');

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

        cmd.run({ message, args, prefix, language, player, games, member: message.author.id }, t);

        this.client.instance.log('COMMAND_EXECUTED', action)

        if (cmd.conf.cooldown > 0) cmd.startCooldown(message.author.id);
    }
};