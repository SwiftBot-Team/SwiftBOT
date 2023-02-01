const Base = require("../../services/Command");

class Damas extends Base {
    constructor(client) {
        super(client, {
            name: "damas",
            description: "descriptions:damas",
            category: "categories:games",
            cooldown: 1000,
            aliases: [],
            bot_permissions: [],
            options: [{
                name: 'member',
                type: 6,
                description: 'Member to challenge',
                required: true
            }]
        });
    }

    async run({ message, args, prefix }, t) {

        if (!message.mentions.members.first()) return message.respond(t('commands:jogodavelha.noMentionUser', { member: message.author.id }));

        //if (message.mentions.members.first() == message.member) return message.respond('Você não pode desafiar à si mesmo!')
        const sendQuestion = await message.respond(t('commands:jogodavelha.sendQuestion', { member: message.mentions.members.first().id, autor: message.author.id }));

        sendQuestion.createReactionCollector((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id === message.mentions.members.first().id, { max: 1, limit: 60000 * 2 })

            .on('collect', async (reaction, user) => {

                sendQuestion.delete({ timeout: 5000 });

                if (reaction.emoji.name === '❌') return message.respond(t('commands:jogodavelha.deny', { member: message.mentions.members.first().id, autor: message.author.id }))

                const { MessageButton, MessageActionRow } = this.client.buttons;

                const p = [message.member, message.mentions.members.first()].shuffle();

                let game = {
                    players: [
                        {
                            player: p[0],
                            type: '856530609038688256',
                            pieces: 5,
                            go: 'up'
                        }, {
                            player: p[1],
                            type: '856530887621345301',
                            pieces: 5,
                            go: 'down'
                        }
                    ],
                    jogadas: 0,
                    atual: {
                        player: p[0],
                        type: '856530609038688256',
                        go: 'up'
                    },
                    status: [
                        {
                            player: p[0]
                        },
                        {
                            player: p[1]
                        }
                    ],
                    board: Array(5).fill(true)
                }

                for (let i = 0; i < game.board.length; i++) {

                    game.board[i] = new MessageActionRow();

                    for (let y = 0; y < game.board.length; y++) {

                        let now = i >= (game.board.length / 2) ? game.players[0] : game.players[1];

                        const button = new MessageButton()
                            .setID(`${i} - ${y}`)
                            .setStyle('gray');
                        i === Math.ceil(game.board.length / 2) - 1 ? button.setLabel(' ') : Boolean((i + 1) % 2) ? Boolean((y + 1) % 2) ? button.emoji = now.type : button.setLabel(' ') : Boolean((y + 1) % 2) ? button.setLabel(' ') : button.emoji = now.type

                        game.board[i].addComponent(button);
                    };
                }

                let init = await message.quote(`Está na vez de ${game.atual.player}! Selecione a peça que deseja mexer.`, { buttons: game.board });

                let isSelect = true;

                let cache = false;

                const collector = init.createButtonCollector(button => button.clicker.user?.id === game.atual.player.id)

                    .on('collect', async (button) => {

                        button.reply.defer();

                        let coords = button.id.split(" - ");

                        const x = Number(coords[0]);

                        const y = Number(coords[1]);

                        if (game.board[x].components[y].emoji?.id !== game.atual.type && isSelect) return;

                        if (isSelect) {

                            isSelect = false;

                            button = new MessageButton()
                                .setStyle('green')
                                .setID(button.id)
                                .setEmoji(game.atual.type);

                            game.board[x].components[y] = button;

                            cache = button;

                            const verify = {
                                checkUpRight: game.board[x + 1] && game.board[x + 1].components[y + 1],
                                checkUpLeft: game.board[x + 1] && game.board[x + 1].components[y - 1],
                                checkDownRight: game.board[x - 1] && game.board[x - 1].components[y + 1],
                                checkDownLeft: game.board[x - 1] && game.board[x - 1].components[y - 1]
                            }

                            for (const [key, value] of Object.entries(verify)) {

                                if (value) {

                                    const [i, j] = value.custom_id.split(" - ");

                                    if (value.label !== ' ') {
                                        if (!game.board[key.includes('Up') ? Number(i) + 1 : Number(i) - 1]) continue;

                                        if (game.board[key.includes('Up') ? Number(i) + 1 : Number(i) - 1].components[key.includes('Right') ? Number(j) + 1 : Number(j) - 1]?.label !== ' ') continue;

                                        if (value.emoji?.id === game.atual.type) continue;
                                    };

                                    if (key.includes('Up') && game.atual.go === 'up') {
                                        if (value.label === ' ') continue;
                                    }

                                    if (key.includes('Down') && game.atual.go === 'down') {
                                        if (value.label === ' ') continue;
                                    }

                                    const b = new MessageButton()
                                        .setID(value.custom_id)
                                        .setStyle('red');
                                    value.label === ' ' ? b.setLabel(' ') : b.emoji = value.emoji.id

                                    game.board[i].components[j] = b
                                }
                            };

                            await init.edit(`Agora, clique para onde deseja mexer a peça.`, { components: game.board })
                        } else {

                            isSelect = true;

                            const selected = game.board[x].components[y];

                            for (let i = 0; i < game.board.length; i++) {
                                for (let j = 0; j < game.board.length; j++) {
                                    if (game.board[i].components[j].style !== 2) {
                                        const b = new MessageButton()
                                            .setStyle('gray')
                                            .setID(game.board[i].components[j].custom_id)

                                        game.board[i].components[j].label === ' ' ? b.setLabel(' ') : b.emoji = game.board[i].components[j].emoji.id

                                        game.board[i].components[j] = b;
                                    }
                                }
                            };

                            if (selected.emoji?.id === game.atual.type) {

                                return collector.emit('collect', button)
                            } else {

                                if (selected.style !== 4) return;

                                const lastPosition = cache.custom_id.split(" - ");

                                const newPosition = selected.custom_id.split(" - ");

                                let i = Number(newPosition[0]) > Number(lastPosition[0]) ? 'down' : 'up';
                                let j = Number(newPosition[1]) > Number(lastPosition[1]) ? 'right' : 'left';

                                if ((i === 'up' ? Number(lastPosition[0]) - 1 : Number(lastPosition[0]) + 1) === Number(newPosition[0]) && selected.label === ' ') {

                                    let b = new MessageButton()
                                        .setStyle('gray')
                                        .setID(cache.custom_id)
                                        .setLabel(' ');

                                    game.board[Number(lastPosition[0])].components[Number(lastPosition[1])] = b;

                                    let eat = new MessageButton()
                                        .setStyle('gray')
                                        .setID(`${x} - ${y}`)
                                        .setEmoji(game.atual.type)

                                    game.board[x].components[y] = eat;

                                    game.atual = game.atual.type === '856530609038688256' ? game.players[1] : game.players[0];

                                    return init.edit(`Está na vez de ${game.atual.player}! Selecione a peça que deseja mexer.`, { components: game.board });

                                }

                                if ((i === 'up' && !game.board[x + 1]) || (i === 'down' && !game.board[x - 1])) return;

                                i = i === 'up' ? x - 1 : x + 1;

                                if (!game.board[i]) return;

                                if ((j === 'right' && !game.board[i].components[y + 1]) || (j === 'left' && !game.board[i].components[y - 1])) return;

                                if ((j === 'right' && game.board[i].components[y + 1].label !== ' ') || (j === 'left' && game.board[i].components[y - 1].label !== ' ')) return;

                                let b = new MessageButton()
                                    .setStyle('gray')
                                    .setID(selected.custom_id)
                                    .setLabel(' ');

                                game.board[x].components[y] = b;

                                const change = new MessageButton()
                                    .setStyle('gray')
                                    .setID(cache.custom_id)
                                    .setLabel(' ')

                                game.board[Number(lastPosition[0])].components[Number(lastPosition[1])] = change;

                                let eat = new MessageButton()
                                    .setStyle('gray')
                                    .setID(`${i} - ${j === 'right' ? y + 1 : y - 1}`)
                                    .setEmoji(game.atual.type)

                                game.players.find(p => p.type !== game.atual.type).pieces--;

                                game.board[i].components[j === 'right' ? y + 1 : y - 1] = eat;

                                if (game.players.find(p => p.type !== game.atual.type).pieces === 0) {
                                    collector.stop();

                                    return init.edit(`${game.atual.player} venceu a partida!`, { components: game.board });
                                }

                                game.atual = game.atual.type === '856530609038688256' ? game.players[1] : game.players[0]



                                return init.edit(`Está na vez de ${game.atual.player}! Selecione a peça que deseja mexer.`, { components: game.board });
                            }


                        }
                    })
            });

        await sendQuestion.react('✅');

        await sendQuestion.react('❌');

    }

}

module.exports = Damas
