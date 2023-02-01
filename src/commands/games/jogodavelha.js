const Base = require("../../services/Command");

class Jogodavelha extends Base {
    constructor(client) {
        super(client, {
            name: "tictactoe",
            description: "descriptions:jogodavelha",
            category: "categories:games",
            cooldown: 1000,
            aliases: ['jogodavelha'],
            bot_permissions: [],
            options: [{
                name: 'member',
                type: 6,
                description: 'Member to challenge',
                required: true
            }, {
                name: 'difficulty',
                type: 3,
                description: 'difficulty to play',
                required: false,
                choices: [{
                    name: 'easy',
                    value: 'Easy'
                }, {
                    name: 'normal',
                    value: 'Normal'
                }, {
                    name: 'hard',
                    value: 'Hard'
                }, {
                    name: 'impossible',
                    value: 'impossible'
                }]
            }]
        });

        this.difficulties = {
            Easy: {
                first: 'Easy',
                second: 'Easy'
            },
            Normal: {
                first: 'Normal',
                second: 'Normal'
            },
            Hard: {
                first: 'Hard',
                second: 'Normal'
            },
            Impossible: {
                first: 'Hard',
                second: 'Hard'
            }
        }
    }

    async run({ message, args, prefix }, t) {

        if (!message.mentions.members.first()) return message.respond(t('commands:jogodavelha.noMentionUser', { member: message.author.id }));

        if (message.mentions.members.first() == message.member) return message.respond('Você não pode desafiar à si mesmo!');

        if (message.mentions.members.first().id === this.client.user.id && !args[1]) return message.respond(`Você precisa inserir uma dificuldade ao me desafiar! [Easy, Normal, Hard]`);

        const difficulties = {
            Easy: ['easy', 'facil'],
            Normal: ['normal', 'medium'],
            Hard: ['hard', 'dificil', 'difícil'],
            Impossible: ['impossible', 'impossível', 'impossivel']
        };

        if (message.mentions.members.first().id === this.client.user.id && !Object.values(difficulties).find(e => e.includes(args[1].toLowerCase()))) return message.respond(`dificuldade inválida!`);

        const diff = args[1] ? Object.entries(difficulties).find(e => e[1].includes(args[1].toLowerCase()))[0] : false;

        const sendQuestion = await message.respond(t('commands:jogodavelha.sendQuestion', { member: message.mentions.members.first().id, autor: message.author.id }));

        sendQuestion.createReactionCollector((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id === message.mentions.members.first().id, { max: 1, limit: 60000 * 2 })

            .on('collect', async (reaction, user) => {

                sendQuestion.delete({ timeout: 5000 });

                if (reaction.emoji.name === '❌') return message.respond(t('commands:jogodavelha.deny', { member: message.mentions.members.first().id, autor: message.author.id }))

                const shuffle = [message.member, message.mentions.members.first()].shuffle();

                let game = {
                    players: [
                        {
                            player: shuffle[0],
                            type: '❌'
                        }, {
                            player: shuffle[1],
                            type: '⭕'
                        }
                    ],
                    jogadas: 0,
                    atual: {
                        player: shuffle[0],
                        type: '❌'
                    },
                    status: [
                        {
                            player: message.member
                        },
                        {
                            player: message.mentions.members.first()
                        }
                    ],
                    board: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],

                    difficultyState: args[1] ? 'first' : false
                }

                const { MessageButton } = this.client.buttons;

                const styles = {
                    'x': {
                        content: ' ',
                        style: 'gray'
                    },
                    '❌': {
                        content: '❌',
                        style: 'green'
                    },
                    '⭕': {
                        content: '⭕',
                        style: 'red'
                    }
                }

                const buttons = Array(9).fill(true).map((_, indice) => new MessageButton().setStyle('gray').setLabel(' ').setID(`${indice}`));

                let init = await message.channel.send(`Está na vez e ${game.atual.player}.`, { components: await this.handleButtons(buttons) });

                const play = async () => {

                    if (game.atual.player.user.id === this.client.user.id) {

                        const { default: { ComputerMove } } = require('tic-tac-toe-minimax');

                        const toPlay = ComputerMove(game.board.map((b, i) => b === 'x' ? i : b), {
                            huPlayer: game.players.find(p => p.player.id === message.author.id).type,
                            aiPlayer: game.players.find(p => p.player.id === this.client.user.id).type
                        }, this.difficulties[diff][game.difficultyState]);

                        game.difficultyState = game.difficultyState === 'first' ? 'second' : 'first';

                        game.jogadas = game.jogadas + 1;

                        game.board[Number(toPlay)] = game.atual.type;

                        buttons[toPlay] = new MessageButton().setStyle(styles[game.atual.type].style).setEmoji(game.atual.type).setID(toPlay)

                        if (game.jogadas > 4) {
                            const check = await this.checkWin(game.board);

                            if (!check && game.jogadas >= 9) {
                                await init.edit(`A partida empatou!`, { components: this.handleButtons(buttons) });

                                return;
                            }

                            if (check) {
                                await init.edit(`Ganhador da partida: ${this.client.user}!`, { components: this.handleButtons(buttons) });

                                return;
                            }

                            game.atual = game.atual.type === '❌' ? game.players[1] : game.players[0];

                            await init.edit(`Está na vez de ${game.atual.player}`, { components: this.handleButtons(buttons) });

                            await play();

                        } else {

                            game.atual = game.atual.type === '❌' ? game.players[1] : game.players[0];

                            await init.edit(`Está na vez de ${game.atual.player}`, { components: this.handleButtons(buttons) });

                            await play();
                        };

                    } else {

                        const collector = init.createButtonCollector(button => button.clicker.user?.id === game.atual.player.id && game.board[button.id] === 'x', { max: 1, time: 60000 * 2, cooldown: 0 });

                        collector.on('collect', async button => {

                            button.reply.defer();

                            game.jogadas = game.jogadas + 1;

                            game.board[button.id] = game.atual.type;

                            buttons[button.id] = new MessageButton().setStyle(styles[game.atual.type].style).setEmoji(styles[game.atual.type].content).setID(button.id)

                            if (game.jogadas > 4) {
                                const check = await this.checkWin(game.board);

                                if (!check && game.jogadas >= 9) {
                                    await init.edit(`A partida empatou!`, { components: this.handleButtons(buttons) })

                                    collector.stop('limit');

                                    return;
                                }

                                if (check) {
                                    await init.edit(`${button.clicker.user} ganhou!`, { components: this.handleButtons(buttons) })

                                    collector.stop('limit');

                                    return;
                                }

                                game.atual = game.atual.type === '❌' ? game.players[1] : game.players[0];

                                await init.edit(`Está na vez de ${game.atual.player}`, { components: this.handleButtons(buttons) })

                                game.atual.player.id === this.client.user.id ? setTimeout(async () => await play(), 1700) : await play();

                            } else {
                                game.atual = game.atual.type === '❌' ? game.players[1] : game.players[0];

                                await init.edit(`Está na vez de ${game.atual.player}`, { components: this.handleButtons(buttons) })

                                game.atual.player.id === this.client.user.id ? setTimeout(async () => await play(), 1700) : await play();
                            }

                        });

                        collector.on('end', async () => {
                            if (collector.endReason() !== 'limit') return message.respond(`O jogo foi finalizado por inatividade de um dos jogadores.`);
                        })

                    };
                };

                game.atual.player.id === this.client.user.id ? setTimeout(async () => await play(), 1700) : await play();
            });

        await sendQuestion.react('✅');

        await sendQuestion.react('❌');

    }

    async checkWin(board) {
        let winStates = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        let status = false;

        for (let i = 0; i < winStates.length; i++) {
            let sequence = winStates[i];

            let
                pos1 = sequence[0], //0
                pos2 = sequence[1], // 1
                pos3 = sequence[2]; // 2

            if (board[pos1] !== 'x' && board[sequence[0]] == board[sequence[1]] && board[sequence[0]] == board[sequence[2]] && board[sequence[1]] == board[sequence[2]]) {

                return {
                    index: i,
                    winner: board[pos1]
                }
            }

            else continue;
        }

        return status;

    }

    handleButtons(buttons) {

        const { MessageActionRow } = this.client.buttons;

        let board = [];

        for (let i = 0, j = 0; i < 9; i += 3, j++) {
            board[j] = new MessageActionRow()

            buttons.slice(i, i + 3).forEach(b => board[j].addComponent(b));
        };

        return board;
    }

    async playMe(bo, player, v) {

        return new Promise(async res => {
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

            const board = [...bo]

            const empty = board.map((e, i) => e === 'x' ? i : null).filter(e => e);


            const check = await this.checkWin(board);

            if (check && check.winner === '❌') return res({ points: -10 });

            if (check && check.winner === '⭕') {
                return res({ points: 10 });
            }


            if (!empty.length) {

                return res({ points: 0 })
            }

            const playeds = [];

            let i = -1;

            for (const _ of empty) {
                new Promise(async resolve => {
                    i++;

                    let played = { points: 0 };

                    played.index = board.map((e, k) => e === 'x' ? k : e)[empty[i]]

                    board[empty[i]] = player;

                    if (player === '⭕') {

                        let result = await this.playMe(board, '❌');
                        played.points += result.points;
                    } else {

                        let result = await this.playMe(board, '⭕');

                        played.points += result.points;
                    };

                    board.map((e, k) => k)[empty[i]] = played.index;

                    playeds.push(played);

                    await resolve(true)
                }).then(e => {

                    if (i === empty.length - 1) {
                        let bestPlayed;

                        if (player === '⭕') {

                            let bestPoints = -100;

                            for (var y = 0; y < playeds.length; y++) {


                                if (playeds[y].points > bestPoints) {

                                    bestPoints = playeds[y].points;

                                    bestPlayed = y
                                }
                            }
                        } else {
                            let bestPoints = 100;

                            for (var y = 0; y < playeds.length; y++) {
                                if (playeds[y].points < bestPoints) {
                                    bestPoints = playeds[y].points;

                                    bestPlayed = y
                                }
                            }
                        };

                        res(playeds[bestPlayed]);
                    }


                })
            }
        })
    }

}

module.exports = Jogodavelha;
