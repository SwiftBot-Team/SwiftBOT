const { Client, Collection } = require('discord.js')
const { readdir } = require("fs");

const FileUtils = require('./utils/FileUtils')

const Guild = require('./database/models/Guild');

const i18next = require('i18next');
const translationBackend = require('i18next-node-fs-backend');
const fs = require('fs');

const chalk = require('chalk')
const _ = require('lodash')

const SwiftEmbed = require('./services/SwiftEmbed.js');

const SwiftManager = require('./services/SwiftMusic/SwiftManager');

const nodes = [
    {
        tag: 'Node 1',
        host: process.env.LAVALINK_HOST,
        port: process.env.LAVALINK_PORT,
        password: process.env.LAVALINK_PASSWORD,
    }
]

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
        if (!guildPrimate) return
        const guild = await Guild.findOne({ guildID: guildPrimate.id })
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
                ownerID: guildPrimate.owner.id,
                ownerUsername: this.users.cache.get(guildPrimate.owner.id).username,
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
        console.log(`[Database] Firebase conectado com sucesso.`)
    }

    async connectLavalink() {
        try {
            this.music = new SwiftManager(this, nodes)
                .on('nodeConnect', node => {
                    console.log(`${node.tag || node.host} - Lavalink connected with success.`)
                })
                .on('trackStart', (player, track) => {
                    player.textChannel.send(`Now playing \`${track.info.title}\``)
                })
        } catch (err) {
            console.log('ERRO NO LAVALINK: ' + err)
        }
        console.log('Online on the client', this.user.username)
    }

    async initListeners() {
        const Listeners = new (require('./services/Listeners.js'))(this);
        Listeners.start();
    }


    async getTranslate(guild) {
        return await new Promise(async (resolve, reject) => {
            let t;

            const setFixedT = (translate) => {
                t = translate
            }

            const language = await this.getLanguage(guild)

            setFixedT(i18next.getFixedT(language))

            i18next.use(translationBackend).init({
                ns: ['categories', 'commands', 'errors', 'permissions', 'utils', 'usages', 'descriptions', 'automod'],
                preload: await fs.readdirSync('./src/languages/'),
                fallbackLng: 'pt',
                backend: {
                    loadPath: `./src/languages/{{lng}}/{{ns}}.json`
                },
                interpolation: {
                    escapeValue: false
                },
                returnEmptyString: false
            }).then(async t => {
                resolve(t);
            })
        })
    }

}