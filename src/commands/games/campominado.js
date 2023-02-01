const Base = require("../../services/Command");

const Minesweeper = require('discord.js-minesweeper');

module.exports = class campominado extends Base {
    constructor(client) {
        super(client, {
            name: 'campominado',
            aliases: ['minesweeper'],
            cooldown: 10000,
            description: "descriptions:campominado",
            category: "categories:games",
        })
    }

    async run({ message, args, prefix, games }, t) {

        const emojis = {
            ":zero:": "0️⃣",
            ":one:": "1️⃣",
            ":two:": "2️⃣",
            ":three:": "3️⃣",
            ":four:": "4️⃣",
            ":five:": "5️⃣",
            ":boom:": "💥",
            "🚩": "🚩",
            "noBoom": "💣"
        };

        const game = new Minesweeper({ rows: 5, columns: 5, mines: 5 });

        const { MessageButton, MessageActionRow } = this.client.buttons;

        const str = game.start().replace(/(\|)/gi, '').split(" ").filter(e => e.replace('\n', '').length)

        const b = str.map((v, i) => new MessageButton().setStyle('gray').setID(v).setLabel(' '))

        const board = Array(5);

        for (let i = 0; i < board.length; i++) {
            board[i] = new MessageActionRow();

            b.slice(i * board.length, (i * board.length) + board.length).forEach((button, column) => {

                button.custom_id = `${i} - ${column}`;

                board[i].addComponent(button);
            });
        };


        const send = await message.quote(t('commands:campominado.gameMessage', { now: 5, max: board.length }), { buttons: board });

        send.react('🚩');

        const buttonCollector = send.createButtonCollector(button => button.clicker.user.id === message.author.id)

        const reactionCollector = send.createReactionCollector((r, u) => r.emoji.name === '🚩' && u.id === message.author.id);

        let react = false;

        reactionCollector.on('collect', async (r) => {
            react = react ? false : true;

            if (message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) r.users.remove(message.author.id);

            const bombs = board.reduce((a, b) => a.concat(b.components), []).filter(e => e.emoji?.name === '🚩');

            return send.edit(react ? t('commands:campominado.bandeira') : t('commands:campominado.gameMessage', { now: board.length - bombs.length, max: board.length }), { components: board })
        });

        buttonCollector.on('collect', async (button) => {
            button.reply.defer();

            const [column, row] = button.id.split(" - ");

            const selected = board[column].components[row];

            const selectedType = react ? '🚩' : str[Number((column * board.length)) + Number(row)];

            react = false;


            board[column].components[row] = new MessageButton(board[column].components[row]).setStyle('gray').setEmoji(emojis[selectedType])

            if (selectedType === ':boom:') {
                buttonCollector.stop();

                reactionCollector.stop();

                return send.edit(t('commands:campominado.lose'), {
                    components: board.map((b, x) => {
                        b.components = b.components.map((button, y) => {
                            button = new MessageButton(button);

                            button.setEmoji(emojis[str[(x * board.length) + y]])

                            return button;
                        });

                        return b;
                    })
                });
            };

            const fullB = board.reduce((a, b) => a.concat(b.components), []).filter(e => !e.emoji);

            if (!fullB.length || fullB.length === 1) {
                buttonCollector.stop();

                reactionCollector.stop();

                return send.edit(t('commands:campominado.win', { max: board.length }), {
                    components: board.map((b, x) => {
                        b.components = b.components.map((button, y) => {

                            button = new MessageButton(button)

                            button.setEmoji(str[(x * board.length) + y] === ':boom:' ? emojis['noBoom'] : emojis[str[(x * board.length) + y]])

                            return button;
                        });

                        return b;
                    })
                });
            }

            let cacheNumbers = []

            cacheNumbers.push(Number(row));

            if (selectedType === ':zero:') handleZeros(Number(row));

            function handleZeros(x) {

                for (let i = 0; i < board.length; i++) {

                    if (i === x) {

                        for (let j = 0; j < board.length; j++) {

                            let cache = [];

                            if (str[(i * board.length) + j] === ':zero:') {

                                if (!str[(i * board.length) + (j + (i > 0 ? 0 : 1))] || str[(i * board.length) + (i > 0 ? 0 : 1)] === ':zero:') {
                                    cache.push(j);
                                };

                                if (!str[(i * board.length) - (j + (i > 0 ? 0 : 1))] || str[(i * board.length) - (i > 0 ? 0 : 1)] === ':zero:') {
                                    cache.push(j);
                                };

                                if (str[((i + 1) * board.length) + j] === ':zero:' && !cacheNumbers.includes(i + 1)) {
                                    cacheNumbers.push(i + 1);
                                    handleZeros(i + 1);
                                }

                                if (str[((i - 1) * board.length) + j] === ':zero:' && !cacheNumbers.includes(i - 1)) {
                                    cacheNumbers.push(i - 1);
                                    handleZeros(i - 1);
                                }
                            };

                            cache.forEach(n => {
                                board[i].components[n].emoji = emojis[':zero:']

                                if (board[i]?.components[n + 1]?.label.length) board[i].components[n + 1].emoji = emojis[str[(i * board.length) + (n + 1)]]
                                if (board[i + 1]?.components[n]?.label.length) board[i + 1].components[n].emoji = emojis[str[((i + 1) * board.length) + (n)]]
                                if (board[i + 1]?.components[n + 1]?.label.length) board[i + 1].components[n + 1].emoji = emojis[str[((i + 1) * board.length) + (n + 1)]]
                                if (board[i + 1]?.components[n - 1]?.label.length) board[i + 1].components[n - 1].emoji = emojis[str[((i + 1) * board.length) + (n - 1)]]

                                if (board[i]?.components[n - 1]?.label.length) board[i].components[n - 1].emoji = emojis[str[(i * board.length) + (n - 1)]]
                                if (board[i - 1]?.components[n]?.label.length) board[i - 1].components[n].emoji = emojis[str[((i - 1) * board.length) + (n)]]
                                if (board[i - 1]?.components[n + 1]?.label.length) board[i - 1].components[n + 1].emoji = emojis[str[((i - 1) * board.length) + (n + 1)]]
                                if (board[i - 1]?.components[n - 1]?.label.length) board[i - 1].components[n - 1].emoji = emojis[str[((i - 1) * board.length) + (n - 1)]];
                            })
                        };
                    }
                }
            }

            const bombs = board.reduce((a, b) => a.concat(b.components), []).filter(e => e.emoji?.name === '🚩');

            return send.edit(t('commands:campominado.gameMessage', { now: board.length - bombs.length, max: board.length }), { components: board })
        })
    }
}
