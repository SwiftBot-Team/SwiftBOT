const { Client, Collection, VoiceChannel, Message, Intents, APIMessage } = require('discord.js');

const axios = require('axios');

Message.prototype.quote = async function (message, options, id) {
    if (!this.interaction) {

        if (typeof options === 'object' && typeof message === 'string' && options.code && typeof options.code === 'string') {
            message = `\`\`\`${options.code}\n${message}\n\`\`\` `
        }

        const data = {
            embed: typeof message === 'object' ? message : undefined,

            content: typeof message === 'string' ? message : undefined,

            message_reference: {
                message_id: this.id || id,
                message_channel: this.channel.id,
                options: typeof options === 'object' ? { ...options } : undefined
            }
        };

        return await this.client.api.channels[this.channel.id]
            .messages
            .post({ data })
            .then(d => this.client.actions.MessageCreate.handle(d).message);
    } else {

        if (typeof message === 'object') {
            console.log('a')
            const { data, files } = await APIMessage.create(this.client.channels.resolve(this.interaction.channel_id), message)
                .resolveData()
                .resolveFiles();

            return this.client.api.interactions(this.interaction.id, this.interaction.token).callback.post({
                data: {
                    type: 4,
                    data: { ...data, files }
                }
            }).then(() => this.interaction = false)
        } else {
            return this.client.api.interactions(this.interaction.id, this.interaction.token).callback.post({
                data: {
                    type: 4,
                    data: { content: message }
                }
            }).then(() => this.interaction = false)
        }
    }
};

Message.prototype.respond = async function (message, hasFooter = true, options) {

    if (typeof message === 'object') return this.quote(message);

    const Embed = new this.client.embed(hasFooter ? this.author : null);

    Embed.setDescription(message)

    if (options && options.footer) Embed.setFooter(options.footer, this.client.user.displayAvatarURL());
    if (options && options.image) Embed.setImage(options.image);
    if (options && options.author) Embed.setAuthor(options.author.text, options.author.image)
    if (options && options.thumbnail) Embed.setThumbnail(options.thumbnail);
    if (options && options.attach) {
        Embed.attachFiles(options.attach)
    };

    const send = await this.quote(Embed);

    return send;
}

const { readdir } = require("fs");

const FileUtils = require('./utils/FileUtils')

const Guild = require('./database/models/Guild');

const Locale = require('../lib')

const fs = require('fs');

const chalk = require('chalk')
const _ = require('lodash')

const SwiftEmbed = require('./services/SwiftEmbed.js');

const { Manager } = require('erela.js');

const Spotify = require('erela.js-spotify');

const { SwiftPlayer } = require('./services/index');

const { notDeepEqual } = require('assert');

const { schedule } = require('node-cron');

const nodes = [{
    tag: 'Node 1',
    host: process.env.LAVALINK_NODE_1_HOST,
    port: Number(process.env.LAVALINK_NODE_1_PORT),
    password: process.env.LAVALINK_NODE_1_PASSWORD,
    identifier: 'Node 1',
    API: process.env.LAVALINK_NODE_1_API
}, {
    tag: 'Node 2',
    host: process.env.LAVALINK_NODE_2_HOST,
    port: Number(process.env.LAVALINK_NODE_2_PORT),
    password: process.env.LAVALINK_NODE_2_PASSWORD,
    identifier: 'Node 2',
    API: process.env.LAVALINK_NODE_2_API
}];

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return hours.toString().replace('0-', '') + 'h ' + minutes.toString().replace('0-', '') + 'm ' + seconds.toString().replace('0-', '') + 's';
}

module.exports = class Swift extends Client {


    constructor(instance, options) {
        super({
            ws: {
                intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_INVITES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING']
            },
            intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_INVITES', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
            presence: {
                activity: {
                    type: 'PLAYING',
                    name: 'https://swift.tk/'
                }
            },
            messageSweepInterval: 60 * 15,
            messageCacheLifetime: 60,
            messageEditHistoryMaxSize: 0,
            messageCacheMaxSize: 50,
            restTimeOffset: 100
        })

        this.instance = instance;

        this.commands = []
        this.events = [];

        this.tts = new Map()

        this.games = {
            werewolf: new Map(),
            2048: new Map(),
            akinator: new Map(),
            chess: new Map(),
            forca: new Map(),
            connect4: new Map(),
            anagrama: new Map(),
            uno: new Map()
        }

        this.musicHeartbeat = new Map();

        this.config = options.config ? require(`../${options.config}`) : {};
        this.perms = options.perms ? require(`../${options.perms}`) : {};

        this.prefixes = new Collection();
        this.languages = new Collection();

        this.customEmojis = []
        this.embed = SwiftEmbed

        this.music = []
        this.controllers = {};

        this.empresas = new Collection();

        this.records = new Map();

        this.msToTime = msToTime;

        this.context = new Map();
    }

    login(token = process.env.TOKEN) {
        return super.login(token)
    }

    log(
        message,
        {
            tags = [],
            bold = false,
            italic = false,
            underline = false,
            reversed = false,
            bgColor = false,
            color = 'white'
        } = {}
    ) {
        const colorFunction = _.get(
            chalk,
            [bold, italic, underline, reversed, bgColor, color].filter(Boolean).join('.')
        )

        console.log(...tags.map(t => chalk.cyan(`[${t}]`)), colorFunction(message))
    }

    loadCommands(dirPath) {
        return FileUtils.requireDirectory(dirPath, (NewCommand) => {
            this.addCommand(new NewCommand(this))
        }, this.log('Loaded', { color: 'green', tags: ['Commands'] }))
    }

    addCommand(command) {
        this.commands.push(command)

        return true
    }

    loadEvents(path) {
        readdir(path, (err, files) => {
            if (err) console.log(err);

            files.forEach(evt => {

                const event = new (require(`../${path}/${evt}`))(this);

                this.events.push(event);

                super.on(evt.split(".")[0], (...args) => this.events.find(e => e.name === evt.split('.')[0]).run(...args));
            });
        });

        return this;
    }

    loadMongo() {
        readdir('./src/database', (err, files) => {
            if (err) console.log(err);

            const file = files.find(file => file === 'MongoDB.js')
            const db = new (require('./database/' + file))(this)
            db.run()
        });
    }

    async initLoaders() {
        return FileUtils.requireDirectory('./src/loaders', (Loader) => {
            Loader.load(this)
        }, this.log('Loaded', { color: 'green', tags: ['Loaders'] }))
    }

    async getPrefix(guildPrimate) {
        if (!guildPrimate) return 'sw';

        const guildID = typeof guildPrimate === 'object' ? guildPrimate.id : guildPrimate

        if (this.prefixes.get(guildID)) return this.prefixes.get(guildID);

        const prefix = await this.database.ref(`SwiftBOT/Servidores/${guildID}/config/prefix`).once('value').then(d => d.val());

        if (!prefix) {
            this.database.ref(`SwiftBOT/Servidores/${guildID}/config/prefix`).set('sw!');
            this.prefixes.set(guildID, 'sw!');

            return 'sw!'
        } else {
            this.prefixes.set(guildID, prefix);
            return prefix
        }
    }

    async getLanguage(guildPrimate) {
        if (!guildPrimate) return 'pt';
        const guildID = typeof guildPrimate === 'object' ? guildPrimate.id : guildPrimate

        if (this.languages.get(guildID)) return this.languages.get(guildID);

        const lang = await this.database.ref(`SwiftBOT/Servidores/${guildID}/config/lang`).once('value').then(d => d.val())

        if (!lang) {
            this.database.ref(`SwiftBOT/Servidores/${guildID}/config/lang`).set('pt');
            this.languages.set(guildID, 'pt');

            return 'pt'
        } else {
            this.languages.set(guildID, lang);
            return lang
        }
    }

    async getActualLocale() {
        return this.t
    }

    async setActualLocale(locale) {
        this.t = locale
    }

    async loadFirebase() {
        const firebase = require('firebase');
        firebase.initializeApp({
            apiKey: process.env.FIREBASE_API,
            authDomain: process.env.FIREBASE_DOMAIN,
            databaseURL: process.env.FIREBASE_URL,
            projectId: process.env.FIREBASE_PROJECTID,
            storageBucket: process.env.FIREBASE_STORAGE,
            messagingSenderId: process.env.FIREBASE_SENDER,
            appId: process.env.FIREBASE_APPID
        })
        this.database = firebase.database();
        this.log('Firebase Conectado com sucesso.', { color: 'green', tags: ['Database'] });

        const databaseListener = require('./database/databaseListener.js');

        this.database.databaseListener = new databaseListener(this);

        this.database.databaseListener.listen();
    }

    async connectLavalink() {
        try {

            this.music = new Manager({
                nodes,
                autoPlay: true,
                send: (guildID, data) => {
                    const guild = this.guilds.cache.get(guildID);

                    if (guild) guild.shard.send(data);
                },
                plugins: [
                    new Spotify({
                        clientID: process.env.SPOTIFY_CLIENT_ID,
                        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
                    })
                ]
            })

                .on('nodeConnect', async (node) => {

                    node.reconnecting = false;

                    this.music.nodes.first().reconnectAttempts = 1;

                    this.log(`${node.options.tag || node.options.host} - Lavalink conectado com sucesso.`, { color: 'green', tags: ['SwiftMusic'] });

                    this.musicHeartbeat.set(node.options.identifier, {});

                    const heartbeats = this.musicHeartbeat.get(node.options.identifier);

                    if (!heartbeats) return;

                    node.send({ op: "ping" });

                    heartbeats.lastheartbeatSent = Date.now();

                    heartbeats.heartbeatInterval = setInterval(() => {
                        if (heartbeats.lastheartbeatSent > heartbeats.lastheartbeatAck) {
                            clearInterval(heartbeats.heartbeatInterval);
                            return;
                        }

                        node.send({ op: "ping" });

                        heartbeats.lastheartbeatSent = Date.now();
                    }, 45000)
                })

                .on('nodeError', async (node, err) => {

                    if (err && err.message.includes('"pong"')) {
                        const heartbeats = this.musicHeartbeat.get(node.options.identifier);

                        if (heartbeats) {
                            heartbeats.lastheartbeatAck = Date.now();
                            heartbeats.ping = heartbeats.lastheartbeatAck - heartbeats.lastheartbeatSent;
                        }

                        return;
                    }

                    this.log(`${node.options.tag || node.options.host} - Lavalink Error: ${err} `, { color: 'red', tags: ['LAVALINK'] });
                })

                .on('nodeDisconnect', async (node, err) => {

                    if (node.reconnecting) return;

                    node.reconnecting = true;

                    this.log(`O node ${node.options.tag || node.options.host} foi desconectado. `, { color: 'red', tags: ['LAVALINK'] });

                    const heartbeats = this.musicHeartbeat.get(node.options.identifier);

                    if (heartbeats) {
                        clearInterval(heartbeats.heartbeatInterval);

                        this.musicHeartbeat.delete(node.options.identifier)
                    };


                    const players = this.music.players.filter(player => player.node.options.host === node.options.host);;

                    for (const player of players.values()) {

                        const newNode = this.music.nodes.find(n => n.options.host !== node.options.host);

                        this.channels.cache.get(player.textChannel)?.send(`Ocorreu um erro no player de música deste servidor, estou realocando o mesmo... `);

                        if (!newNode) {
                            this.channels.cache.get(player.textChannel)?.send(`Ocorreu um erro ao trocar de player: \`Não há nodes disponíveis\` `);
                        };

                        const { position, queue, voiceChannel, textChannel, guild } = player;

                        await player.destroy();

                        const newPlayer = await this.music.create({
                            voiceChannel,
                            textChannel,
                            guild,
                            node: newNode.options.identifier
                        });

                        newPlayer.reconnect = true;

                        newPlayer.queue.add(queue.current);

                        if (newPlayer.state === 'DISCONNECTED') newPlayer.connect();

                        queue.forEach(q => newPlayer.queue.add(q));

                        this.channels.cache.get(player.textChannel)?.send(`Node realocado com sucesso.`);

                        await newPlayer.play(queue.current);
                    }
                })

                .on('trackStart', async (player, track) => {

                    if (player.reconnect) {
                        delete player.reconnect;

                        return;
                    }

                    track.startAt = Date.now();

                    track.pausedTime = 0;

                    const t = await this.getTranslate(player.guild);

                    const msg = await this.channels.cache.get(player.textChannel).send(new this.embed()
                        .setDescription(t('utils:music.trackStart', { music: track.title, url: track.uri })));

                    track.messageID = msg.id;

                    player.messageID = msg.id;

                    player.lastTrack = track;

                })

                .on('queueEnd', async (player) => {

                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel).messages.fetch(player.messageID).then(async msg => {
                        if (msg !== undefined) msg.delete({ timeout: 3000 })
                    }).catch(err => { });

                    if (player.autoPlay) {
                        const track = await this.music.search(player.lastTrack.author).then(res => res.tracks ? res.tracks[player.lastIndex] || res.tracks[res.tracks.length - 1] : false);

                        if (!track) {
                            this.channels.cache.get(player.textChannel).send(new this.embed().setDescription(t('utils:music.queueEnd'))).then(async msg => { msg.delete({ timeout: 60000 * 5 }) })
                        } else {
                            player.queue.add(track);

                            player.lastIndex++;

                            player.play();
                        };

                        return;
                    }

                    this.channels.cache.get(player.textChannel).send(new this.embed().setDescription(t('utils:music.queueEnd'))).then(async msg => { msg.delete({ timeout: 60000 * 5 }) })

                    player.destroy();
                })

                .on('trackEnd', async (player, track) => {


                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel).messages.fetch(track.messageID).then(async msg => {
                        if (msg !== undefined) msg.delete({ timeout: 3000 })
                    }).catch(err => { });
                })

                .on('trackError', async (player, track, error) => {

                    if (error.error == 'This IP address has been blocked by YouTube (429).') {

                        this.music.emit('nodeDisconnect', player.node);

                        axios({
                            url: `https://api.heroku.com/apps/${player.node.options.host.split('.')[0]}/dynos`,
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${player.node.options.API}`,
                                'Accept': 'application/vnd.heroku+json; version=3',
                            }
                        }).then(async res => {
                            console.log(`Node ${player.node.options.identifier} reiniciado.`)
                        });

                    } else {
                        const t = await this.getTranslate(player.guild);

                        this.channels.cache.get(player.textChannel)
                            .send(new this.embed().setDescription(t('utils:music.trackError', { track: `[${track.title}](${track.uri})`, error: error.error || error.message })));

                    }
                })

                .on('trackStuck', async (player, track, error) => {

                    console.log(error)

                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel)
                        .send(new this.embed().setDescription(t('utils:music.trackError', { track: `[${track.title}](${track.uri})`, error: error.error || error.message })));

                    player.destroy();
                })
        } catch (err) {
            console.log(err)
        }
    }

    async initListeners() {
        const Listeners = new (require('./services/Listeners.js'))(this);
        Listeners.start();
    }


    async getTranslate(guild) {
        let language
        if (guild) {
            language = await this.getLanguage(guild)
        } else {
            language = 'pt'
        }

        let l = new Locale('src/languages', {
            returnUndefined: false,
            defaultLanguage: 'pt',
            debug: false
        })

        await l.init()

        l.setLang(language)

        return l.t.bind(l)
    }

    async loadEmpresas() {
        const allRef = await this.database.ref(`SwiftBOT/empresas/`).once('value').then(d => d.val());

        if (!allRef) return;

        for (const [key, value] of Object.entries(allRef)) {
            this.empresas.set(key, { ...value, lojas: value.lojas ? value.lojas : {} });

            if (value.lojas) Object.entries(value.lojas).map(loja => {
                setInterval(() => {
                    if (!this.empresas.get(key) || !this.empresas.get(key).lojas[loja[0]]) return;

                    this.empresas.get(key).lojas[loja[0]].cacheMoney += loja[1].workers.itemValue;
                }, loja[1].workers.cooldown)
            })
        }

        schedule('0 0 * * *', () => {
            this.empresas.keyArray().map(key => {
                const empresa = this.empresas.get(key);

                Object.entries(empresa.lojas).map(async ([k, value]) => {

                    value.cacheMoney -= ((value.workers.worker_payment * value.cacheMoney / 100) * value.workers.size);

                    value.cacheMoney -= value.customers_value.default * value.customers_value.multiplier;

                    this.empresas.get(key).saldo += value.cacheMoney;

                    await this.database.ref(`SwiftBOT/empresas/${key}`).update({
                        saldo: Number(empresa.saldo) + value.cacheMoney
                    });

                    this.empresas.get(key).lojas[k].cacheMoney = 0;

                })
            })
        }, { timezone: 'America/Sao_Paulo' });

        setInterval(() => {
            this.database.ref(`SwiftBOT/empresas`).set(Object.fromEntries(this.empresas))
        }, 60000 * 10)
    }

}
