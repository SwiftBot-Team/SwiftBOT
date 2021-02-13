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
            category: "categories:fun"
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

    async run({ message, args, prefix }) {

        if (args[0] && ['top', 'rank', 'ranking'].includes(args[0].toLowerCase())) {
            const ref = await this.client.database.ref(`SwiftBOT/2048`).once('value').then(db => db.val());

            const embed = new this.client.embed()
                .setAuthor('2048 - Top 10 pontuações', this.client.user.displayAvatarURL())
                .setImage('https://user-images.githubusercontent.com/43895268/66124286-5e488700-e5ba-11e9-8abd-c4cd389f634f.gif');

            return Promise.all(Object.values(ref).sort((a, b) => b.value - a.value).slice(0, 10).map((v, i) => {
                const m = {
                    1: '🥇',
                    2: '🥈',
                    3: '🥉'
                };

                embed.addField(`${m[i + 1] || '🏅'} ${this.client.users.cache.get(v.id).tag}`, `${v.value.toString().split("").map(i => emojis[i]).join('')}`)
            })).then(res => message.channel.send(embed))
        }

        if (args[0] && isNaN(args[0])) return this.respond(`${message.member}, este não é um tamanho de tabuleiro válido!`);

        if (Number(args[0]) > 8 || Number(args[0]) < 4) return this.respond(`${message.member}, o tabuleiro deve ser de tamanho no mímimo 4 e no máximo 8!`);

        let game = new Game(args[0] ? Number(args[0]) : 4);
        game.addCard();
        game.addCard();

        // await findAll(board, this.emojis[0].name).sort(() => 0.5 - Math.random()).slice(0, 2).map(r => board[r] = this.emojis[1].name)

        const messageJogo = async (board) => await this.handleMessage(game.board);

        const send = await message.channel.send(await messageJogo(game.board));

        const directions = [{
            emoji: '⏩',
            name: 'right'
        }, {
            emoji: '⏪',
            name: 'left'
        }, {
            emoji: '⬆️',
            name: 'up'
        }, {
            emoji: '⬇️',
            name: 'down'
        }];

        directions.map(async r => await send.react(r.emoji));

        const start = async () => {

            const collector = send.createReactionCollector((r, u) => directions.map(d => d.emoji).includes(r.emoji.name) && u.id === message.author.id, { time: 60000 * 5 })

            collector.on('collect', async (r, u) => {
                const usedPosition = directions.find(d => d.emoji === r.emoji.name).name;

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

                    board.filter(i => i !== this.emojis[1].name).map((b, i) => pontuação += this.emojis.find(e => e.name === b).value)

                    const ref = await this.client.database.ref(`SwiftBOT/2048`).once('value').then(db => db.val() || {});

                    if (!ref[message.author.id] || ref[message.author.id].value < pontuação) ref[message.author.id] = { value: pontuação, id: message.author.id }

                    await this.client.database.ref(`SwiftBOT/2048`)
                        .set(ref);

                    const max = Object.values(ref).sort((a, b) => b.value - a.value)[0];

                    const embed = new this.client.embed()
                        .setAuthor('SwiftBOT - 2048', this.client.user.displayAvatarURL())
                        .setDescription(`Jogo finalizado! Pontuação total: ${pontuação.toString().split("").map(i => emojis[i]).join('')}
                        
                        **Jogue novamente com o comando \`${prefix}2048\`**\n `)
                        .addField('Sua maior pontuação: ', `${ref[message.author.id].value.toString().split("").map(i => emojis[i]).join('')}`, true)
                        .addField('Maior pontuação:', `${max.value.toString().split("").map(i => emojis[i]).join('')} \`(${this.client.users.cache.get(max.id).tag})\` `, true)
                        .setImage('https://user-images.githubusercontent.com/43895268/66124286-5e488700-e5ba-11e9-8abd-c4cd389f634f.gif')


                    send.reactions.cache.map(r => r.users.remove(this.client.user.id));

                    collector.stop('user')
                    return send.edit('', { embed })
                }

                game.addCard();

                await send.edit(await messageJogo(game.board));

                collector.stop('user')

                setTimeout(() => start(), 1000)
            })

            collector.on('end', async (collected, reason) => {
                if (!['limit', 'user'].includes(reason)) return this.respond('O jogo foi cancelado por inatividade.');
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
