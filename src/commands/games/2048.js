const Base = require("../../services/Command");

const Game = require('../../services/2048.js');

const findAll = (a, v) => a.reduce((s, e, i) => e === v ? [...s, i] : s, []);

const emojis = [
    '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣',
    '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣',
];

module.exports = class Doismilequarentaeoito extends Base {
    constructor(client) {
        super(client, {
            name: '2048',
            aliases: [],
            cooldown: 10000,
            description: "descriptions:2048",
            category: "categories:games",
            options: [{
                name: 'top',
                type: 3,
                description: 'See 2048 top',
                required: false,
                choices: [{
                    name: 'top',
                    value: 'top'
                }],
            }, {
                name: 'tamanho',
                type: 4,
                description: 'Board size',
                choices: Array(5).fill(true).map((_, i) => ({ name: i + 4, value: i + 4 })),
                required: false
            }]
        })

        this.emojis = [
            {
                value: 0,
                name: '<:0_:788096542027284500>',
                id: '788096542027284500'
            },
            {
                value: 2,
                name: '<:2_:788095109043454012>',
                id: '788095109043454012'
            },
            {
                value: 4,
                name: '<:4_:788095124911030303>',
                id: '788095124911030303'
            },
            {
                value: 8,
                name: '<:8_:788095156607123486>',
                id: '788095156607123486'
            },
            {
                value: 16,
                name: '<:16:788095156632420363>',
                id: '788095156632420363'
            },
            {
                value: 32,
                name: '<:32:788095156611186728>',
                id: '788095156611186728'
            },
            {
                value: 64,
                name: '<:64:788095156750516224>',
                id: '788095156750516224'
            },
            {
                value: 128,
                name: '<:128:788095156754317372>',
                id: '788095156754317372'
            }, {
                value: 256,
                name: '<:256:788448342585376779>',
                id: '788448342585376779'
            }, {
                value: 512,
                name: '<:512:788448342622601216>',
                id: '788448342622601216'
            }, {
                value: 1024,
                name: '<:1024:788448342447095848>',
                id: '788448342447095848'
            }, {
                value: 2048,
                name: '<:2048:788448342328999957>',
                id: '788448342328999957'
            }, {
                value: 4096,
                name: '<:4096:788448342366617621>',
                id: '788448342366617621'
            }, {
                value: 8192,
                name: '<:8192:788448342173941821>',
                id: '788448342173941821'
            }]
    }

    async run({ message, args, prefix, games }, t) {

        if (args[0] && ['top', 'rank', 'ranking'].includes(args[0].toLowerCase())) {
            const ref = await this.client.database.ref(`SwiftBOT/2048`).once('value').then(db => db.val());

            const embed = new this.client.embed()
                .setAuthor(t('commands:2048.topAuthor'), this.client.user.displayAvatarURL())
                .setImage('https://user-images.githubusercontent.com/43895268/66124286-5e488700-e5ba-11e9-8abd-c4cd389f634f.gif');

            return Promise.all(Object.values(ref).sort((a, b) => b.value - a.value).slice(0, 5).map((v, i) => {
                const m = {
                    1: '🥇',
                    2: '🥈',
                    3: '🥉'
                };

                embed.addField(`${m[i + 1] || '🏅'} ${this.client.users.cache.get(v.id)?.tag || 'Desconhecido'}`, `${v.value.toString().split("").map(i => emojis[i]).join('')}`)
            })).then(res => message.quote(embed))
        }

        if (args[0] && (isNaN(args[0] || (Number(args[0]) > 8 || Number(args[0]) < 4)))) return message.respond(t('commands:2048.invalidSize', { member: message.author.id }));

        const verify = games['2048'].get(message.author.id);

        if (verify) {
            await this.client.database.ref(`SwiftBOT/2048-board/${message.author.id}`).set(verify.game);

            if (verify.message) {
                if (message.channel.messages.cache.get(verify.message)) message.channel.messages.cache.get(verify.message).delete({ timeout: 1000 });
            }
        }

        const ref = await this.client.database.ref(`SwiftBOT/2048-board/${message.author.id}`).once('value').then(d => d.val());

        let game = new Game(args[0] ? Number(args[0]) : 4, ref ? args[0] ? false : ref : false);

        if (!ref || args[0]) {
            game.addCard();
            game.addCard();
        }

        if (args[0] && Number(args[0]) > 4) {
            message.channel.send(t('commands:2048.statisticsNotSave'));
        }

        const messageJogo = async (board) => await this.handleMessage(game.board);

        const { MessageButton } = this.client.buttons;

        const directions = [{
            button: new MessageButton().setStyle('blurple').setID('⬅️').setEmoji('⬅️'),
            name: 'left'
        }, {
            button: new MessageButton().setStyle('blurple').setID('➡️').setEmoji('➡️'),
            name: 'right'
        }, {
            button: new MessageButton().setStyle('blurple').setID('⬆️').setEmoji('⬆️'),
            name: 'up'
        }, {
            button: new MessageButton().setStyle('blurple').setID('⬇️').setEmoji('⬇️'),
            name: 'down'
        }];

        const send = await message.quote(await messageJogo(game.board), { buttons: directions.map(d => d.button) });

        this.client.games['2048'].set(message.author.id, {
            game: game.board,
            message: send.id
        })

        const start = async () => {

            const collector = send.createButtonCollector(button => button.clicker.user?.id === message.author.id, { idle: 60000 * 5, cooldown: 1200 })

            collector.on('collect', async (button) => {
                button.reply.defer();

                const usedPosition = directions.find(d => d.button.custom_id === button.id).name;

                switch (usedPosition) {
                    case 'right':
                        game.play(false, false, true, false);
                        break;
                    case 'left':
                        game.play(false, false, false, true);
                        break;
                    case 'down':
                        game.play(false, true, false, false);
                        break
                    case 'up':
                        game.play(true, false, false, false)
                        break;
                }


                const check = await game.checkGame();

                if (!check) {

                    collector.stop();

                    let pontuação = 0;

                    game.board.map(e => e.filter(i => i !== 2).map(i => pontuação += this.emojis.find(e => e.value === i).value))

                    const ref = await this.client.database.ref(`SwiftBOT/2048`).once('value').then(db => db.val() || {});

                    if (!ref[message.author.id] || (ref[message.author.id].value < pontuação && (args[0] ? Number(args[0] < 5) : true))) ref[message.author.id] = { value: pontuação, id: message.author.id }

                    await this.client.database.ref(`SwiftBOT/2048`)
                        .set(ref);

                    const max = Object.values(ref).sort((a, b) => b.value - a.value)[0];

                    const embed = new this.client.embed()
                        .setAuthor('SwiftBOT - 2048', this.client.user.displayAvatarURL())
                        .setDescription(`${t('commands:2048.endGame')} ${pontuação.toString().split("").map(i => emojis[i]).join('')}
                        
                        **${t('commands:2048.playAgain')} \`${prefix}2048\`**\n `)
                        .addField(t('commands:2048.bestPoints'), `${ref[message.author.id].value.toString().split("").map(i => emojis[i]).join('')}`, true)
                        .addField(t('commands:2048.bestPointsAll'), `${max.value.toString().split("").map(i => emojis[i]).join('')} \`(${this.client.users.cache.get(max.id)?.tag || 'Desconhecido'})\` `, true)
                        .setImage('https://user-images.githubusercontent.com/43895268/66124286-5e488700-e5ba-11e9-8abd-c4cd389f634f.gif')


                    send.reactions.cache.map(r => r.users.remove(this.client.user.id));

                    collector.stop('user');

                    if (ref) this.client.database.ref(`SwiftBOT/2048-board/${message.author.id}`).remove();

                    this.client.games['2048'].delete(message.author.id);

                    return send.edit('', { embed })
                }

                this.client.games['2048'].set(message.author.id, { game: game.board, message: send.id });

                game.addCard();

                await send.edit(await messageJogo(game.board));
            })

            collector.on('end', async (collected, reason) => {

                if (!message.channel.messages.cache.get(send.id)) return;

                if (!['limit', 'user'].includes(reason)) return message.respond(t('commands:2048.canceled', { prefix }));

                this.client.games['2048'].set(message.author.id, {
                    game: game.board
                })

                this.client.database.ref(`SwiftBOT/2048-board/${message.author.id}`).set(game.board);
            })
        }

        start();
    }

    async handleMessage(array) {

        const emojis = [
            '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣',
            '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣',
        ]

        let amount = Math.ceil(array.length / 4);
        let points = 0;

        array.map(e => e.filter(i => i !== 2).map(i => points += this.emojis.find(e => e.value === i).value))

        let message = `${points.toString().split("").map(i => emojis[i]).join('')}\n\n`;

        for (let i = 0; i < array.length; i++) {
            message += array[i].map(e => this.emojis.find(emoji => emoji.value === e).name).join("") + '\n'
        }


        return message;
    }
}
