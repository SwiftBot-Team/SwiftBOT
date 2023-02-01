const { Message, APIMessage, Channel, TextChannel, Collection, GuildMember, User, Collector } = require('discord.js');

const { get } = require("emoji-unicode-map");

const axios = require('axios');

const { MessageButton, MessageActionRow } = require('discord-buttons');


class unicodeEmoji {
    constructor(unicode, name) {
        this.name = name;

        this.unicode = unicode;
    }

    toString() {
        return this.unicode
    }

    get url() {
        let codes = [];

        for (const code of this.unicode) {
            const codePoint = code.codePointAt(0).toString(16);

            let possibles = {
                2: '00' + codePoint,
                3: '0' + codePoint,
                4: codePoint,
                5: codePoint
            }
            codes.push(possibles[codePoint.length]);
        };

        return `https://twemoji.maxcdn.com/2/72x72/${codes.join('-')}.png`
    }
};

Object.defineProperties(Collection.prototype, {
    'length': {
        get: function getLength() {
            return this.size;
        }
    }
});

Object.defineProperties(Message.prototype, {
    'emojis': {
        get: function getEmojis() {
            this._emojis = new Collection();

            for (const emoji of this.content.split(" ").filter(e => get(e))) {

                this._emojis.set(emoji, new unicodeEmoji(emoji, get(emoji)))
            }

            for (let match of this.content.matchAll(/<(a)?:([\w\d]{2,32})+:(\d{17,19})>/g)) {
                const [, animated, name, id] = match;

                const emoji = this.client.emojis.cache.get(id) || {
                    animated: Boolean(animated),
                    id,
                    name,
                    url: this.client.rest.cdn.Emoji(id, Boolean(animated) ? 'gif' : 'png'),
                    toString: () => match
                }

                this._emojis.set(emoji.id, emoji)
            }

            return this._emojis;
        }
    },
    'quote': {
        value: async function (message, options, id) {

            if (this.interaction === undefined) {
                if (typeof options === 'object' && typeof message === 'string' && options.code && typeof options.code === 'string') {
                    message = `\`\`\`${options.code}\n${message}\n\`\`\` `
                };

                const message_reference = {
                    message_id: (
                        !!message && !options
                            ? typeof message === 'object' && message.messageID
                            : options && options.messageID
                    ) || this.id,
                    message_channel: this.channel.id
                }

                const allowed_mentions = {
                    parse: ['users', 'roles', 'everyone'],
                    replied_user: typeof message === 'object' ? message && +message.mention : options && +options.mention
                }

                const { data, files } = await APIMessage.create(this, message, options)
                    .resolveData()
                    .resolveFiles();

                if (options && options.buttons || options && options.components) data['components'] = (options.buttons || options.components)[0] instanceof MessageActionRow ?
                    (options.buttons || options.components).map(row => {
                        return {
                            type: 1,
                            components: row.components
                        }
                    }) : [{
                        type: 1,
                        components: options.buttons
                    }]

                return await this.client.api.channels[this.channel.id]
                    .messages
                    .post({ data: { ...data, message_reference, allowed_mentions }, files })
                    .then(d => this.client.actions.MessageCreate.handle(d).message);

            } else if (this.interaction.replied) {
                return await this.channel.send(message, options);
            } else {
                let result;

                const { data: parsed, files } = await APIMessage.create(this.client.channels.resolve(this.interaction.channel_id), message, options)
                    .resolveData()
                    .resolveFiles();

                if (options && options.buttons || options && options.components) parsed['components'] = (options.buttons || options.components)[0] instanceof MessageActionRow ?
                    (options.buttons || options.components).map(row => {
                        return {
                            type: 1,
                            components: row.components
                        }
                    }) : [{
                        type: 1,
                        components: options.buttons
                    }]

                return this.client.api.webhooks[this.client.user.id][this.interaction.token].messages['@original'].patch({
                    data: {
                        ...parsed
                    },
                    files
                }).then((r) => {
                    this.interaction.replied = true;
                    return this.client.actions.MessageCreate.handle(r).message;
                })
            }
        }
    }
});

Object.defineProperties(TextChannel.prototype, {
    'send': {
        value: async function (content, options) {
            let apiMessage;

            if (content instanceof APIMessage) {
                apiMessage = content.resolveData()
            } else {

                //if(typeof content === 'string') await Promise.all(Object.values(process.env).map(value  => {
                //	content = content.replace(value, 'Informação sigilosa')
                //}));

                apiMessage = APIMessage.create(this, content, options).resolveData();

                if (Array.isArray(apiMessage.data.content)) return Promise.all(apiMessage.split().map(this.send.bind(this)))
            }

            const { data, files } = await apiMessage.resolveFiles();

            return this.client.api.channels[this.id].messages.post({ data, files }).then(d => this.client.actions.MessageCreate.handle(d).message)
        }
    }
})

Object.defineProperties(Map.prototype, {
    'array': {
        value: function array() {
            const arr = [];

            for (const i of this) arr.push(i[1]);

            return arr;
        }
    },
    'first': {
        value: function first() {
            const arr = [];

            for (const i of this) arr.push(i[1]);

            return arr[0]
        }
    }
});

Object.defineProperties(Array.prototype, {
    'shuffle': {
        value: function array() {
            for (let i = this.length - 1; i > 0; i--) {
                const j = ~~(Math.random() * (i + 1));

                [this[i], this[j]] = [this[j], this[i]];
            };

            return this;
        }
    }
});

Object.defineProperties(Collector.prototype, {
    'handleCollect': {
        value: async function handleCollect(...args) {

            const collect = this.collect(...args);

            if (collect && (await this.filter(...args, this.collected))) {

                if (this.cooldown) {

                    if (args[0].token) {

                        const { discordID, token } = args[0];

                        this.client.api.interactions(discordID, token).callback.post({
                            data: {
                                type: 4,
                                data: {
                                    content: 'Ops! Você está utilizando os botões rápido demais! Por favor, aguarde pelo menos 1 segundo.',
                                    flags: 64
                                }
                            }
                        })
                    }
                    return;
                }

                this.cooldown = true;

                setTimeout(() => {
                    this.cooldown = false
                }, this.options.cooldown || 1500);

                this.collected.set(collect, args[0]);

                this.emit('collect', ...args);

                if (this._idletimeout) {
                    this.client.clearTimeout(this._idletimeout);
                    this._idletimeout = this.client.setTimeout(() => this.stop('idle'), this.options.idle);
                }
            } else if (collect && !this.ended && !(await this.filter(...args, this.collected))) {

                if (args[0].token) {

                    const { token, discordID } = args[0];

                    this.client.api.interactions(discordID, token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: `Hey, você não tem autorização para interagir aqui! Por favor, use o comando para conseguir utilizar.`,
                                flags: 64
                            }
                        }
                    })
                }
            } else if (args[0].token && this.ended) {

                const { discordID, token } = args[0];

                this.client.api.interactions(discordID, token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: `Ops! Eu não estou coletando mais botões nesta mensagem. Por favor, execute novamente o comando.`,
                            flags: 64
                        }
                    }
                })
            }

            this.checkEnd();
        }
    }
})
