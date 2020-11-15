const Base = require("../../services/Command");

class Jogodavelha extends Base {
    constructor(client) {
        super(client, {
            name: "jogodavelha",
            description: "descriptions:jogodavelha",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ['tictactoe'],
            bot_permissions: []
        });

        this.finish = false;
    }

    async run({ message, args, prefix }, t) {
        if (!message.mentions.members.first()) return this.respond(t('commands:jogodavelha.noMentionUser', { member: message.author.id }));

        let game = {
            players: [
                {
                    player: message.member,
                    type: '❌'
                }, {
                    player: message.mentions.members.first(),
                    type: '⭕'
                }
            ],
            jogadas: 0,
            atual: {
                player: message.member,
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
            board: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x']
        }

        let messageJogo = `1️⃣2️⃣3️⃣\n4️⃣5️⃣6️⃣\n7️⃣8️⃣9️⃣`;

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
        const emojisToCompare = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

        let init = await message.channel.send('<a:Loading:745327497096331314> Carregando tabuleiro.');

        const play = () => {

            const collector = init.createReactionCollector((r, u) => emojis.includes(r.emoji.name) && u.id === game.atual.player.user.id, { max: 1, time: 60000 * 2 });

            collector.on('collect', async (r, u) => {
                game.jogadas = game.jogadas + 1;
                game.board[emojisToCompare.indexOf(r.emoji.name)] = game.atual.type;

                let edited = await messageJogo.replace(r.emoji.name, game.atual.type);

                messageJogo = messageJogo.replace(r.emoji.name, game.atual.type);
                await init.edit(messageJogo)

                if (message.guild.me.permissions.has('MANAGE_EMOJIS')) r.remove();

                emojis.splice(emojis.indexOf(r.emoji.name), 1);

                if (game.jogadas > 4) {
                    const check = await this.checkWin(game.board);

                    if (this.finish === false && game.jogadas >= 9) {
                        await init.edit(`A partida empatou! \n\n ${messageJogo}`);
                        return;
                    }

                    if (this.finish === true) {
                        await init.edit(`Ganhador da partida: ${game.atual.player}! \n\n ${messageJogo}`);
                        return;
                    }

                    game.atual = game.atual.player === message.member ? game.players[1] : game.players[0];
                    await play();

                } else {
                    game.atual = game.atual.player === message.member ? game.players[1] : game.players[0];
                    await play();
                }

            });

            collector.on('end', async () => {
                if (collector.endReason() !== 'limit') return this.respond(`O jogo foi finalizado por inatividade de um dos jogadores.`);
            })

        };

        for (let i = 0; i < emojis.length; i++) {
            init.react(emojis[i]).then(async emoji => {
                if (i === emojis.length - 1) {
                    await init.edit(messageJogo, null);
                    await play();
                }
            })
        };

    }

    checkWin(board) {
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

        for (let i = 0; i < winStates.length; i++) {
            let sequence = winStates[i];

            let
                pos1 = sequence[0], //0
                pos2 = sequence[1], // 1
                pos3 = sequence[2]; // 2

            console.log(board[pos1] + " - " + board[pos2] + " - " + board[pos3]);


            if (board[pos1] !== 'x' && board[sequence[0]] == board[sequence[1]] && board[sequence[0]] == board[sequence[2]] && board[sequence[1]] == board[sequence[2]]) return this.finish = true;
            //if ((board[pos1] == board[pos2] && board[pos1] == board[pos3]) && board[pos1] != 'x') return this.finish = true;

            else continue;
        }

    }
}

module.exports = Jogodavelha;