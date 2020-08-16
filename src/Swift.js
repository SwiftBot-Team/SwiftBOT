const { Client, Collection } = require('discord.js')
const { readdir } = require("fs");

const FileUtils = require('./utils/FileUtils')

const Guild = require('./database/models/Guild');

const chalk = require('chalk')
const _ = require('lodash')

const SwiftEmbed = require('./services/SwiftEmbed.js')

const { GorilinkManager } = require('gorilink');

const { SwiftMusic } = require("./services/Music");

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
                    prefix: 's!',
                    lang: 'pt'
                })
                return 's!'
            }
        }
    }

    async getLanguage(guildPrimate, guildDB) {
        const guild = await guildDB.findOne({ guildID: guildPrimate.id })
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
            await guildDB.create({
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
        this.music = new GorilinkManager(this, nodes, {
            Player: SwiftMusic
        })
            .on('nodeConnect', node => {
                console.log(`${node.tag || node.host} - Lavalink conectado com sucesso!`)
            })
    }
  
  async initListeners() {
    const Listeners = new (require('./services/Listeners.js'))(this);
    Listeners.start();
  }
  
}