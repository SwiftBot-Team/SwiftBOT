const { Client, Collection, VoiceChannel, Message } = require('discord.js');


// Message.prototype.quote = async function (message, options, id) {

//     if (typeof options === 'object' && typeof message === 'string' && options.code && typeof options.code === 'string') {
//         message = `\`\`\`${options.code}\n${message}\n\`\`\` `
//     }

//     const data = {
//         embed: typeof message === 'object' ? message : undefined,

//         content: typeof message === 'string' ? message : undefined,

//         message_reference: {
//             message_id: this.id || id,
//             message_channel: this.channel.id,
//             options: typeof options === 'object' ? { ...options } : undefined
//         }
//     };

//     return await this.client.api.channels[this.channel.id]
//         .messages
//         .post({ data })
//         .then(d => this.client.actions.MessageCreate.handle(d).message);
// }

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
        
        this.empresas = new Collection();

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
                    this.log(`${node.options.tag || node.options.host} - Lavalink conectado com sucesso.`, { color: 'green', tags: ['SwiftMusic'] });

                    setTimeout(async () => {
                        const player = await this.music.create({
                            guild: '584456795259535379',
                            voiceChannel: '647910309054382110',
                            textChannel: '744254460796207135'
                        });

                        if (player.state === 'DISCONNECTED') player.connect();

                        const music = await this.music.search('https://www.youtube.com/watch?v=FY5N8_9HbVU', this.user);

                        if (!music.tracks[0]) return this.log('Não encontrei nenhuma música para tocar ao ligar.', { color: 'red', tags: ['SwiftMusic'] });

                        player.queue.add(music.tracks[0]);

                        await player.play();

                        setTimeout(() => player.pause(true), 3000);
                    }, 5000)
                })

                .on('nodeError', async (node, err) => this.log(`${node.options.tag || node.options.host} - Lavalink Error: ${err} `, { color: 'red', tags: ['LAVALINK'] }))

                .on('nodeDisconnect', async (node, err) => this.log(`O node ${node.options.tag || node.options.host} foi desconectado. `, { color: 'red', tags: ['LAVALINK'] }))

                .on('trackStart', async (player, track) => {

                    track.startAt = Date.now();

                    track.pausedTime = 0;

                    const t = await this.getTranslate(player.guild);

                    const msg = await this.channels.cache.get(player.textChannel).send(new this.embed()
                        .setDescription(t('utils:music.trackStart', { music: track.title, url: track.uri })));

                    track.messageID = msg.id;

                    player.messageID = msg.id;

                })

                .on('queueEnd', async (player) => {

                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel).send(new this.embed().setDescription(t('utils:music.queueEnd'))).then(async msg => { msg.delete({ timeout: 60000 * 5 }) })

                    this.channels.cache.get(player.textChannel).messages.fetch(player.messageID).then(async msg => {
                        if (msg !== undefined) msg.delete({ timeout: 3000 })
                    }).catch(err => { });

                    player.destroy();
                })

                .on('trackEnd', async (player, track) => {


                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel).messages.fetch(track.messageID).then(async msg => {
                        if (msg !== undefined) msg.delete({ timeout: 3000 })
                    }).catch(err => { });
                })

                .on('trackError', async (player, track, error) => {

                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel)
                        .send(new this.embed().setDescription(t('utils:music.trackError', { track: `[${track.title}](${track.uri})`, error: error.message })))

                    player.destroy();
                })

                .on('trackStuck', async (player, track, error) => {
                    const t = await this.getTranslate(player.guild);

                    this.channels.cache.get(player.textChannel)
                        .send(new this.embed().setDescription(t('utils:music.trackError', { track: `[${track.title}](${track.uri})`, error: error.message })));

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
        const language = await this.getLanguage(guild)

        const translate = new Locale('src/languages')

        const t = await translate.init({
            returnUndefined: false
        })

        translate.setLang(language)

        return t
    }
    
    async loadEmpresas() {
        const allRef = await this.database.ref(`SwiftBOT/empresas/`).once('value').then(d => d.val());
  
        if(!allRef) return;
  
        for(const [key, value] of Object.entries(allRef)) {
            this.empresas.set(key, { ...value, lojas: value.lojas ? value.lojas : {} });
      
            Object.entries(value.lojas).map(loja => {
                setInterval(() => {
                    if(!this.empresas.get(key) || !this.empresas.get(key).lojas[loja[0]]) return;
                    
                    this.empresas.get(key).lojas[loja[0]].cacheMoney += loja[1].workers.itemValue;
                }, loja[1].workers.cooldown)
            })
        }
  
        schedule('0 0 * * *', () => {
            this.empresas.keyArray().map(key => {
                const empresa = this.empresas.get(key);
          
                Object.entries(empresa.lojas).map(([k, value]) => {
              
                    value.cacheMoney -= ((value.workers.worker_payment * value.cacheMoney / 100) * value.workers.size);
              
                    value.cacheMoney -= value.customers_value.default * value.customers_value.multiplier;
              
                    this.database.ref(`SwiftBOT/empresas/${key}`).update({
                        saldo: Number(empresa.saldo) + value.cacheMoney
                    }).then(() => this.empresas.get(key).lojas[k].cacheMoney = 0;)
              
                })
            })
        });
        
        setInterval(() => {
            this.client.database.ref(`SwiftBOT/empresas`).set(Object.fromEntries(this.client.empresas))
        }, 60000 * 10)
    }

}
