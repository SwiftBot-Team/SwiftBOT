const { Client, Collection, VoiceChannel } = require('discord.js')
const { readdir } = require("fs");

const FileUtils = require('./utils/FileUtils')

const Guild = require('./database/models/Guild');

const Locale = require('../lib/index')

const fs = require('fs');

const chalk = require('chalk')
const _ = require('lodash')

const SwiftEmbed = require('./services/SwiftEmbed.js');

const { GorilinkManager, GorilinkPlayer } = require('gorilink');

const { SwiftPlayer } = require('./services/index');
const { notDeepEqual } = require('assert');

const nodes = [
    {
        tag: 'Node 1',
        host: 'swiftlavalink.herokuapp.com',
        port: 80,
        password: "securepassword"
    }
]

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return hours.toString().replace('0-', '') + 'h ' + minutes.toString().replace('0-', '') + 'm ' + seconds.toString().replace('0-', '') + 's';
}

module.exports = class Swift extends Client {


    constructor(instance, options) {
        super({})

        this.instance = instance;

        this.commands = []
        this.config = options.config ? require(`../${options.config}`) : {};
        this.perms = options.perms ? require(`../${options.perms}`) : {};

        this.prefixes = new Collection();

        this.customEmojis = []
        this.embed = SwiftEmbed

        this.music = []
        this.controllers = {}

        this.msToTime = msToTime;
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

                super.on(evt.split(".")[0], (...args) => event.run(...args));
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

    async getPrefix(guildPrimate, guildDB) {
        if (guildPrimate && ['729715039413469345', '711623214467645470'].includes(guildPrimate.id)) return "sw!";
        if (!guildPrimate) return 's!'
        if (guildPrimate.id === '631467420510584842') return 'sw!'

        if (this.prefixes.get(guildPrimate.id)) {
            return this.prefixes.get(guildPrimate.id);
        } else {
            const guild = await guildDB.findOne({ guildID: guildPrimate.id })
            if (guild) {
                let prefix = guild.prefix
                this.prefixes.set(guildPrimate.id, prefix)
                return prefix
            } else {
                await guildDB.create({
                    guildID: guildPrimate.id,
                    guildName: guildPrimate.name,
                    ownerID: guildPrimate.owner.id,
                    ownerUsername: this.users.cache.get(guildPrimate.owner.id).username,
                    prefix: 'sw!',
                    lang: 'pt'
                })
                return 'sw!'
            }
        }
    }

    async getLanguage(guildPrimate) {
        if (!guildPrimate) return;
        const guild = await Guild.findOne({ guildID: !isNaN(guildPrimate) ? guildPrimate : guildPrimate.id });



        if (guild) {
            let lang = guild.lang

            if (lang === undefined) {
                guild.lang = 'pt';
                guild.save()

                return 'pt'
            } else {
                return lang
            }
        } else {

            await Guild.create({
                guildID: guildPrimate.id,
                guildName: guildPrimate.name,
                ownerID: guildPrimate.ownerID,
                ownerUsername: this.users.fetch(guildPrimate.ownerID).username,
                prefix: 's!',
                lang: 'pt'
            })
            return 'pt'
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
    }

    async connectLavalink() {
        try {
            this.music = new GorilinkManager(this, nodes, {
                Player: SwiftPlayer
            })
                .on('nodeConnect', async node => {
                    this.log(`${node.tag || node.host} - Lavalink conectado com sucesso.`, { color: 'green', tags: ['SwiftMusic'] });

                    setTimeout(async () => {
                        const player = await this.music.join({
                            guild: '584456795259535379',
                            voiceChannel: '647910309054382110',
                            textChannel: this.guilds.cache.get('584456795259535379').channels.cache.get('744254460796207135')
                        });

                        const music = await this.music.fetchTracks('https://www.youtube.com/watch?v=FY5N8_9HbVU');

                        if (!music.tracks[0]) return console.log('Não encontrei nenhuma música para tocar ao ligar.')
                        await player.queue.add(music.tracks[0]);

                        await player.play();

                        await player.pause(true)
                    }, 5000)
                })

                .on('trackStart', async (player, track) => {

                    const t = await this.getTranslate(player.guild);

                    const msg = await player.textChannel.send(new this.embed()
                        .setDescription(t('utils:music.trackStart', { music: track.info.title, url: track.info.uri })));

                    track.info.messageID = msg.id;
                    player.messageID = msg.id;
                })

                .on('queueEnd', async (player, track) => {
                    const t = await this.getTranslate(player.guild);

                    player.textChannel.send(new this.embed().setDescription(t('utils:music.queueEnd'))).then(async msg => { msg.delete({ timeout: 60000 * 5 }) })

                    player.textChannel.messages.fetch(player.messageID).then(async msg => {
                        if (msg !== undefined) msg.delete({ timeout: 3000 })
                    }).catch(err => { });

                    this.music.leave(player.guild);


                })
                .on('trackEnd', async (player, track) => {
                    const t = await this.getTranslate(player.guild);

                    player.textChannel.messages.fetch(track.info.messageID).then(async msg => {
                        if (msg !== undefined) msg.delete({ timeout: 3000 })
                    }).catch(err => { });

                    const guild = this.guilds.cache.get(player.guild);

                    if (guild.me.voice.channel.members.filter(m => !m.user.bot).size < 1) {
                        this.music.leave(player.guild);
                        player.textChannel.send(new this.embed().setDescription(t('utils:music.noMembers')))
                    }
                })
                .on('nodeClose', async node => {
                    console.log(node)
                    this.log(`A conexão com o node ${node.tag || node.host} foi perdida.`, { color: 'red', tags: ['SwiftMusic'] })
                })
                .on('nodeError', async error => {
                    this.log(`Ocorreu um erro ao conectar ao Lavalink.`, { color: 'red', tags: ['SwiftMusic'] })
                })
        } catch (err) {

        }
    }

    async initListeners() {
        const Listeners = new (require('./services/Listeners.js'))(this);
        Listeners.start();
    }


    async getTranslate(guild) {
        const language = await this.getLanguage(guild)

        const translate = new Locale('src/languages')

        const t = await translate.init({
            returnUndefined: false
        })

        translate.setLang(language)

        return t
    }

}