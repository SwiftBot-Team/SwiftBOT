const SwiftPlayer = require('./SwiftPlayer');

class Command extends SwiftPlayer {
    constructor(client, options) {

        super();

        this.client = client;
        this.help = {
            name: options.name || null,
            description: options.description || "descriptions:default",
            usage: options.usage || "usages:default",
            category: options.category || "categories:default"
        };
        this.conf = {
            permissions: options.permissions || [],
            cooldown: options.cooldown || 1000,
            aliases: options.aliases || [],
            bot_permissions: options.bot_permissions || [],
            allowDMs: options.allowDMs || false,
            devsOnly: options.devsOnly || false,
            hidden: options.hidden || false,
            nsfw: options.nsfw || false,
            requiresChannel: options.requiresChannel || false
        };
        this.cooldown = new Map();
    }

    startCooldown(user) {
        this.cooldown.set(user, Date.now() + this.conf.cooldown);

        setTimeout(() => {
            this.cooldown.delete(user);
        }, this.conf.cooldown);
    }

    setMessage(message, args) {
        this.message = message;
        this.args = args;
    }

    getUsers(arg = false) {

        const args = arg ? arg.split(" ") : this.args;

        const users = args
            .filter(arg => this.message.guild.members.cache.get(arg.replace(/[^0-9]/gi, '')) || this.message.guild.members.cache.find(c => c.user.username === arg) || this.message.guild.members.cache.find(c => c.nickname === arg))
            .map(arg => this.message.guild.members.cache.get(arg.replace(/[^0-9]/gi, '')) || this.message.guild.members.cache.find(c => c.user.username === arg) || this.message.guild.members.cache.find(c => c.nickname === arg))

        return users;
    }

    getRoles(argg = false) {

        const args = argg ? argg.split(" ") : this.args;

        const roles = args
            .filter(arg => this.message.guild.roles.cache.get(arg.replace(/[^0-9]/gi, '')) || this.message.guild.roles.cache.find(r => r.name === arg))
            .map(arg => this.message.guild.roles.cache.get(arg.replace(/[^0-9]/gi, '')) || this.message.guild.roles.cache.find(r => r.name === arg))

        return roles;
    }

    getEmojis(argg = false) {

        const unicode = require("emoji-unicode-map");

        const args = argg ? argg.split(" ") : this.args;

        const emojis = args
            .filter(arg => this.client.emojis.cache.get(arg.replace(/[^0-9]/gi, '')) || unicode.get(arg))
            .map(e => e.replace(/[^0-9]/gi, '').length ? e.replace(/[^0-9]/gi, '') : e);

        return emojis;
    }

    async respond(message, hasFooter = true, options) {
        const Embed = new this.client.embed(hasFooter ? this.message.author : null)
        Embed.setDescription(message)

        if (options && options.footer) Embed.setFooter(options.footer, this.client.user.displayAvatarURL());
        if (options && options.image) Embed.setImage(options.image);
        if (options && options.author) Embed.setAuthor(options.author.text, options.author.image)
        if (options && options.thumbnail) Embed.setThumbnail(options.thumbnail);

        const send = await this.message.channel.send(Embed)

        return send;
    }

    getEmoji(emojiName, fallback) {
        if (typeof fallback === 'undefined') fallback = '❓'
        const emojis = Object.keys(this.client.customEmojis).filter(k => parseInt(k))
        if (!emojis) return fallback

        const matchingEmoji = this.client.customEmojis.find(e => e.name.toLowerCase() === emojiName.toLowerCase())
        if (matchingEmoji) return matchingEmoji.toString()
        else return fallback
    }

    async verifyRequirementes(t) {
        const Embed = new this.client.embed()

        const opts = this.conf

        const botGuild = this.client.guilds.cache.get(process.env.OFICIAL_GUILD);
        const developerRole = botGuild.roles.cache.get('764922809985138698');
        const isDeveloper = botGuild.members.cache.get(this.message.author.id) ? (botGuild.members.cache.get(this.message.author.id).roles.cache.has(developerRole.id)) : false;

        if (opts.devsOnly && !isDeveloper && !['375356261211963392', '417067105897414667'].includes(this.message.author.id)) {
            Embed
                .setTitle(`**Hey, ${this.message.author.username}**`)
                .setDescription(t('errors:devsOnly'))
                .setFooter(this.message.author.username, this.message.author.displayAvatarURL())

            this.message.channel.send(Embed)
            return true
        }

        if (opts.bot_permissions && opts.bot_permissions.length > 0) {
            if (!this.message.guild.members.cache.get(this.client.user.id).permissions.has(opts.bot_permissions)) {
                let translated = []
                if (opts.bot_permissions.length > 1) {
                    opts.bot_permissions.filter(perm => !this.message.guild.me.permissions.has(perm)).map(p => {
                        translated.push(t('permissions:' + p))
                    })
                }

                Embed
                    .setTitle(`**Hey, ${this.message.author.username}**`)
                    .setDescription(t(`errors:botPermissionError.${opts.bot_permissions.length > 1 ? 'plural' : 'singular'}`, { perm: (opts.bot_permissions.length > 1 ? translated.join(' | ') : t('permissions:' + opts.bot_permissions[0])) }))
                    .setFooter(this.message.author.username, this.message.author.displayAvatarURL())

                this.message.channel.send(Embed)
                return true
            }
        }

        if (opts.permissions && opts.permissions.length > 0 && !isDeveloper) {
            if (!this.message.guild.members.cache.get(this.message.author.id).permissions.has(opts.permissions)) {
                let translated = []
                if (opts.bot_permissions.length > 1) {
                    opts.bot_permissions.map(p => {
                        translated.push(t('permissions:' + p))
                    })
                }

                Embed
                    .setTitle(`**Hey, ${this.message.author.username}**`)
                    .setDescription(t(`errors:userPermissionError.${opts.permissions.length > 1 ? 'plural' : 'singular'}`, { perm: (opts.permissions.length > 1 ? translated.join(' | ') : t('permissions:' + opts.permissions[0])) }))
                    .setFooter(this.message.author.username, this.message.author.displayAvatarURL())

                this.message.channel.send(Embed)
                return true
            }
        }

        if (opts.nsfw && !process.env.DEVELOPERS.includes(this.message.author.id)) {
            this.message.channel.send(new this.client.embed(this.message.author).setDescription(`${this.message.author}, este comando só pode ser executado com um canal \`NSFW\`! `));
            return true;
        }

        if (this.help.category === 'categories:music') {
            if (!this.conf.requiresChannel) return;

            if (['playlist'].includes(this.help.name)) return;

            if (!this.message.member.voice.channel) return this.respond(t('utils:music.canal', { member: this.message.author.id }));

            if (this.message.guild.me.voice.channel && this.message.guild.me.voice.channel !== this.message.member.voice.channel)
                return this.respond(t('utils:music.canal2', { member: this.message.author.id }));

            if (['remove', 'loop', 'queue', 'skip', 'pause', 'stop', 'lyrics', 'volume', 'tocando', 'seek'].includes(this.help.name) && !this.client.music.players.get(this.message.guild.id))
                return this.respond(t('utils:music.noPlaying', { member: this.message.author.id }));
        }

        return false
    }


}

module.exports = Command;