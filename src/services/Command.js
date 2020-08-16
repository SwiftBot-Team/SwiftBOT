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
            hidden: options.hidden || false
        };
        this.cooldown = new Set();
    }

    startCooldown(user) {
        this.cooldown.add(user);

        setTimeout(() => {
            this.cooldown.delete(user);
        }, this.conf.cooldown);
    }

    setMessage(message) {
        this.message = message;
    }

    respond(message) {
        this.message.channel.send(message);
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

        const botGuild = this.client.guilds.cache.get(process.env.OFICIAL_GUILD)
        const developerRole = botGuild.roles.cache.get('685788548687069196')
        const isDeveloper = (botGuild.members.cache.get(this.message.author.id).roles.cache.has(developerRole.id))

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
                        translated.push(t('permissions:'+p))
                    })
                }
                
                Embed
                    .setTitle(`**Hey, ${this.message.author.username}**`)
                    .setDescription(t(`errors:botPermissionError.${opts.bot_permissions.length > 1 ? 'plural' : 'singular'}`, { perm: (opts.bot_permissions.length > 1 ? translated.join(' | ') : t('permissions:'+opts.bot_permissions[0])) }))
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
                        translated.push(t('permissions:'+p))
                    })
                }
                
                Embed
                    .setTitle(`**Hey, ${this.message.author.username}**`)
                    .setDescription(t(`errors:userPermissionError.${opts.permissions.length > 1 ? 'plural' : 'singular'}`, { perm: (opts.permissions.length > 1 ? translated.join(' | ') : t('permissions:'+opts.permissions[0])) }))
                    .setFooter(this.message.author.username, this.message.author.displayAvatarURL())

                this.message.channel.send(Embed)
                return true
            }
        }

        return false
    }

}

module.exports = Command;