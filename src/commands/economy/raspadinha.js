const Base = require("../../services/Command");

class raspadinha extends Base {
    constructor(client) {
        super(client, {
            name: "raspadinha",
            description: "descriptions:raspadinha",
            category: "categories:economy",
            cooldown: 1000,
            aliases: ['tele-sena'],
            devsOnly: true
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) {
            const mapIds = this.client.raspadinhaEmojis.map(e => e.id).filter((v, i, a) => a.indexOf(v) === i);
            const emojis = mapIds.map(e => this.client.raspadinhaEmojis.filter(r => r.id === e)[0]);

            return this.respond(`Raspadinha do Swift! Utilize ${prefix}raspadinha comprar para comprar uma raspadinha! Veja abaixo os prêmios!
            
            ${emojis.map(e => `${e.nome} - \`${e.valor}\` `).join("\n")}`)
        }

        if (['buy', 'comprar'].includes(args[0].toLowerCase())) {
            const rasp = async (edit) => {
                const board = [];

                let collected = false;

                let reacted = false;

                const emoji = [];

                for (let i = 0; i < 9; i++) {
                    let random = this.client.raspadinhaEmojis[Math.floor(Math.random() * this.client.raspadinhaEmojis.length)]
                    emoji.push(random);
                    board.push(random.id)
                }

                const msg = edit ? await edit.edit(`Aqui está sua raspadinha de número ${Math.floor(Math.random() * 100)}! Reaja abaixo para pegar sua recomepnsa. \n\n||${emoji[0].nome}||||${emoji[1].nome}||||${emoji[2].nome}||\n||${emoji[3].nome}||||${emoji[4].nome}||||${emoji[5].nome}||\n||${emoji[6].nome}||||${emoji[7].nome}||||${emoji[8].nome}||`) : await message.channel.send(`Aqui está sua raspadinha de número ${Math.floor(Math.random() * 100)}! Reaja abaixo para pegar sua recomepnsa. \n\n||${emoji[0].nome}||||${emoji[1].nome}||||${emoji[2].nome}||\n||${emoji[3].nome}||||${emoji[4].nome}||||${emoji[5].nome}||\n||${emoji[6].nome}||||${emoji[7].nome}||||${emoji[8].nome}||`)
                msg.react('✅');
                msg.react('🔁')
                const collector = msg.createReactionCollector((r, u) => ['✅', '🔁'].includes(r.emoji.name) && u.id === message.author.id)

                    .on('collect', async r => {
                        switch (r.emoji.name) {
                            case '✅':
                                const verify = await this.verifyEmojis(board);

                                if (!verify.length) {
                                    if (reacted) return;

                                    reacted = true;

                                    return this.respond('Você não ganhou nada nesta raspadinha!').then(messa => messa.delete({ timeout: 5000 }))
                                }

                                if (collected) {
                                    if (reacted) return;

                                    reacted = true;

                                    return this.respond('Eii, você já colhetou esta raspadinha!').then(messa => messa.delete({ timeout: 5000 }))
                                }

                                collected = true;

                                let money = 0;

                                for (let i = 0; i < verify.length; i++) {
                                    money += verify[i].valor
                                };

                                await this.respond(`Você ganhou \`${money}\` nesta raspadinha. 
                            
                            Sequências sorteadas:
                            ${verify.map(c => `${c.nome}${c.nome}${c.nome} - \`${c.valor}\` `).join("\n")}`)
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
}
module.exports = raspadinha;