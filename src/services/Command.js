class Command {
    constructor(client, options) {
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
            nsfw: options.nsfw || false
        };
        this.cooldown = new Set();
    }

    startCooldown(user) {
        this.cooldown.add(user);

        setTimeout(() => {
            this.cooldown.delete(user);
        }, this.conf.cooldown);
    }

    setMessage(message, args) {
        this.message = message;
        this.args = args;
    }

    getUsers() {
        const array = [];

        for (let i = 0; i < this.args.length; i++) {
            let tostring = this.args[i].toString().replace('@', '').replace('<', '').replace('>', '').replace('!', '');

            const user = this.message.guild.members.cache.get(tostring) || this.message.guild.members.cache.find(member => member.user.username === this.args[i]) || this.message.guild.members.cache.find(member => member.nickname === this.args[i]);
            if (user) array.push(user);

        }

        return array;
    }
    async respond(message, hasFooter = true, options) {
        const Embed = new this.client.embed(hasFooter ? this.message.author : null)
        Embed.setDescription(message)

        if (options && options.footer) Embed.setFooter(options.footer);
        if (options && options.image) Embed.setImage(options.image);
        if (options && options.author) Embed.setAuthor(options.author.text, options.author.image)

        const send = await this.message.channel.send(Embed);

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

        if (opts.devsOnly && !isDeveloper) {
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
                    opts.bot_permissions.map(p => {
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

        if (opts.permissions && opts.permissions.length > 0) {
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

        if (opts.nsfw) {
            this.message.channel.send(new this.client.embed(this.message.author).setDescription(`${this.message.author}, este comando só pode ser executado com um canal \`NSFW\`! `));
            return true;
        }

        if (this.help.category === 'categories:music') {
            if (['playlist'].includes(this.help.name)) return; if (!this.message.member.voice.channel) return this.respond(t('utils:music.canal', { member: this.message.author.id }));

            if (this.message.guild.me.voice.channel && this.message.guild.me.voice.channel !== this.message.member.voice.channel)
                return this.respond(t('utils:music.canal2', { member: this.message.author.id }));

            if (['remove', 'loop', 'queue', 'skip', 'pause', 'stop', 'lyrics', 'volume', 'tocando'].includes(this.help.name) && !this.client.music.players.get(this.message.guild.id))
                return this.respond(t('utils:music.noPlaying', { member: this.message.author.id }));
        }

        return false
    }


}

module.exports = Command;