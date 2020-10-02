const Guild = require('../database/models/Guild');
const i18next = require('i18next')
const translationBackend = require('i18next-node-fs-backend')
const fs = require('fs');

const { v4 } = require('uuid')
const { msToTime, convertHourToMinutes } = require('../utils/index')

let t;

module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(message) {
        if (!message.author.id === process.env.OWNER_ID) return

        if (message.channel.type == 'dm') return;
        if (message.author.bot) return;
        if (!message.content.startsWith(await this.client.getPrefix(message.guild, Guild))) return

        const prefix = await this.client.getPrefix(message.guild, Guild)

        const args = message.content.split(/\s+/g);
        const command = args.shift().slice(String(await this.client.getPrefix(message.guild, Guild)).length).toLowerCase();
        const cmd = this.client.commands.find(c => c.help.name.toLowerCase() === command || (c.conf.aliases && c.conf.aliases.includes(command)));

        if (!cmd) return;

        cmd.setMessage(message, args);


        const t = await this.client.getTranslate(message.guild);

        const Embed = new this.client.embed(message.author)

        if (cmd.cooldown.has(message.author.id)) {
            return message.channel.send(Embed.setDescription('<:errado:739176302317273089> ' + t('errors:cooldownError')))
        }

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
                cmd
            }
        ]

        cmd.run({ message, args, prefix }, t);
        this.client.instance.log('COMMAND_EXECUTED', action)

        if (cmd.conf.cooldown > 0) cmd.startCooldown(message.author.id);
    }
};