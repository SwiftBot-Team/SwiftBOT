const Base = require("../../services/Command");

module.exports = class Corridadecavalo extends Base {
    constructor(client) {
        super(client, {
            name: 'corridadecavalo',
            aliases: ['horserace'],
            cooldown: 10000,
            category: "categories:games",
        })
    }

    async run({ message }) {

        const cavalos = [{
            name: '🟥',
            speed: 0,
            position: 0
        },
        {
            name: '🟦',
            speed: 0,
            position: 0
        },
        {
            name: '🟩',
            speed: 0,
            position: 0
        },
        {
            name: '🟧',
            speed: 0,
            position: 0
        },
        {
            name: '🟫',
            speed: 0,
            position: 0
        }];

        const space = 25;

        let isWinning = cavalos[0];

        let cavalo1 = await this.handlePosition(cavalos[0].position, space, cavalos[0].name)
        let cavalo2 = await this.handlePosition(cavalos[1].position, space, cavalos[1].name)
        let cavalo3 = await this.handlePosition(cavalos[2].position, space, cavalos[2].name)
        let cavalo4 = await this.handlePosition(cavalos[3].position, space, cavalos[3].name)
        let cavalo5 = await this.handlePosition(cavalos[4].position, space, cavalos[4].name)

        const embed = new this.client.embed()
            .setAuthor('A corrida de cavalos está em andamento!')
            .setDescription(`ﾠﾠ🏁
     ${cavalos[0].name}${cavalo1}
     ${cavalos[1].name}${cavalo2}
     ${cavalos[2].name}${cavalo3}
     ${cavalos[3].name}${cavalo4}
     ${cavalos[4].name}${cavalo5}`)

        const msg = await message.channel.send(embed);

        const interval = setInterval(async () => {
            if (isWinning.position >= space) {
                clearInterval(interval);

                if (!cavalos.filter(c => c.position >= isWinning.position && c.name !== isWinning.name).length) return message.channel.send(`O cavalo de cor ${isWinning.name} venceu!`);

                else message.channel.send(`Os cavalos ${cavalos.filter(c => c.position >= isWinning.position).map(c => c.name).join(', ')} empataram!`);

            } else {

                await cavalos.map((e, i) => {
                    cavalos[i].speed = Math.floor(Math.random() * 6);

                    cavalos[i].position += cavalos[i].speed + cavalos[i].position >= space ? space - cavalos[i].position : cavalos[i].speed
                });

                cavalo1 = await this.handlePosition(cavalos[0].position, space);
                cavalo2 = await this.handlePosition(cavalos[1].position, space);
                cavalo3 = await this.handlePosition(cavalos[2].position, space);
                cavalo4 = await this.handlePosition(cavalos[3].position, space);
                cavalo5 = await this.handlePosition(cavalos[4].position, space);

                isWinning = cavalos.sort((a, b) => b.position - a.position)[0];

                const secondEmbed = new this.client.embed()
                    .setAuthor('A corrida de cavalos está em andamento!')
                    .setDescription(`ﾠﾠ🏁
     ${cavalos[0].name}${cavalo1}
     ${cavalos[1].name}${cavalo2}
     ${cavalos[2].name}${cavalo3}
     ${cavalos[3].name}${cavalo4}
     ${cavalos[4].name}${cavalo5}`)

                await msg.edit({ embed: secondEmbed });
            }
        }, 3000)

    }

    async updateBoard(board, message) {
        return;
    }

    async handlePosition(actual, max) {

        return new Promise(res => {
            const percent = actual / max;

            const progress = Math.round((max * percent));

            const empty = max - progress;

            const text = 'ﾠ'.repeat(progress);

            const secondText = 'ﾠ'.repeat(empty)

            return res(`${secondText}🏇${text}`)

        })
    }
}
