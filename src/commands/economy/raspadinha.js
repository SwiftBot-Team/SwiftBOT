const Base = require("../../services/Command");

class raspadinha extends Base {
    constructor(client) {
        super(client, {
            name: "raspadinha",
            description: "descriptions:raspadinha",
            category: "categories:economy",
            cooldown: 1000,
            aliases: ['tele-sena']
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) {
            const mapIds = this.client.raspadinhaEmojis.map(e => e.id).filter((v, i, a) => a.indexOf(v) === i);
            const emojis = mapIds.map(e => this.client.raspadinhaEmojis.filter(r => r.id === e)[0]);

            return message.respond(t('commands:raspadinha.see', {
                prefix,
                emojis: emojis.map(e => `${e.nome} - \`${e.valor}\` `).join("\n")
            }))
        }

        if (['buy', 'comprar'].includes(args[0].toLowerCase())) {

            const rasp = async (edit) => {

                if (await this.client.controllers.money.getBalance(message.author.id) < 250) return message.respond(t('commands:raspadinha.noMoney', { member: message.author.id }));

                this.client.controllers.money.setBalance(message.author.id, -250);

                const board = [];

                let collected = false;

                let reacted = false;

                const emoji = [];

                let number = this.client.raspNumber + 1;

                this.client.raspNumber++;

                for (let i = 0; i < 9; i++) {
                    let random = this.client.raspadinhaEmojis.shuffle()[0];
                    emoji.push(random);
                    board.push(random.id)
                }

                const m = t('commands:raspadinha.hereIs', {
                    number,
                    board: this.handleBoard(emoji)
                });

                const msg = edit ? await edit.edit(m) : await message.channel.send(m);

                msg.react('✅');
                msg.react('🔁');

                const collector = msg.createReactionCollector((r, u) => ['✅', '🔁'].includes(r.emoji.name) && u.id === message.author.id)

                    .on('collect', async r => {
                        switch (r.emoji.name) {
                            case '✅':
                                const verify = await this.verifyEmojis(board);

                                if (!verify.length) {
                                    if (reacted) return;

                                    reacted = true;

                                    return message.respond(t('commands:raspadinha.noWon')).then(messa => messa.delete({ timeout: 5000 }))
                                }

                                if (collected) {
                                    if (reacted) return;

                                    reacted = true;

                                    return message.respond(t('commands:raspadinha.alread')).then(messa => messa.delete({ timeout: 5000 }))
                                }

                                collected = true;

                                let money = 0;

                                for (let i = 0; i < verify.length; i++) {
                                    await this.client.controllers.money.setBalance(message.author.id, verify[i].valor)
                                    money += verify[i].valor
                                };

                                await message.respond(t('commands:raspadinha.won', {
                                    money,
                                    emojis: verify.map(c => `${c.nome}${c.nome}${c.nome} - \`${c.valor}\` `).join("\n")
                                }))
                                break;

                            case '🔁':
                                collector.stop();

                                return rasp(msg);
                                break;
                        }
                    })
            }

            rasp()
        }
    }


    async verifyEmojis(board) {

        let wins = [];

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
            const sequence = winStates[i];

            let
                pos1 = sequence[0], //0
                pos2 = sequence[1], // 1
                pos3 = sequence[2]; // 2

            if (board[pos1] == board[pos2] && board[pos1] == board[pos3] && board[pos2] == board[pos3]) {
                wins.push(this.client.raspadinhaEmojis.find(e => e.id === board[pos1]));
            }

            else continue;
        }

        return wins;


    }

    handleBoard(board) {
        let string = '||';


        for (let i = 0; i < board.length; i += 3) {
            string += board.slice(i, i + 3).map(i => i.nome).join("||||") + `|| \n${i === board.length - 3 ? '' : '||'}`;
        };

        return string;
    }
}
module.exports = raspadinha;