const { Collection } = require('discord.js');

const request = require('request');

const { JSDOM } = require('jsdom');
const { stringify } = require('yaml');

module.exports = class AnagramGame {

    constructor(client, message, t) {
        this.client = client;

        this.message = message;

        this.t = t;

        this.users = new Collection();
    }

    async start() {
        this.message.channel.send(this.t('commands:anagrama.starting'));

        this.playNew();
    }

    async playNew() {
        const t = this.t;

        request('https://www.palabrasaleatorias.com/palavras-aleatorias.php/', async (err, res) => {

            const dom = new JSDOM(res.body);

            const word = await this.client.apis.translate.translate(dom.window.document.querySelector("table div").innerHTML.toLowerCase().replace('\n', ''), 'auto', 'pt').then(translated => translated.result.toLowerCase().split(" ")[0].normalize('NFD').replace(/[\u0300-\u036f]/g, ""))

            const specialCodes = {
                '0': ':zero:',
                '1': ':one:',
                '2': ':two:',
                '3': ':three:',
                '4': ':four:',
                '5': ':five:',
                '6': ':six:',
                '7': ':seven:',
                '8': ':eight:',
                '9': ':nine:',
                '#': ':hash:',
                '*': ':asterisk:',
                '?': ':grey_question:',
                '!': ':grey_exclamation:',
                ' ': ' ',
                'ç': 'c',
                'á': 'a',
                'é': 'e',
                'í': 'i',
                'ó': 'o',
                'ú': 'u',
                'â': 'a',
                'ê': 'e',
                'î': 'i',
                'ô': 'o',
                'û': 'u',
                'ã': 'a',
                'õ': 'o',
                '-': '-'
            }

            const transform = word.split("").map(str => specialCodes[str] ? /[a-z]/gi.test(str) ? `:regional_indicator_${specialCodes[str]}:` : specialCodes[str] : `:regional_indicator_${str}:`);

            const embed = new this.client.embed()
                .setAuthor(t('commands:anagrama.30'), 'https://cdn.discordapp.com/emojis/806910753649983499.png?v=1')
                .setDescription(transform.shuffle().join(""));

            this.message.quote(embed).then(msg => {
                this.collector = msg.channel.createMessageCollector(m => (m.content.split("").map(str => specialCodes[str.toLowerCase()] || str.toLowerCase()).join("").toLowerCase() === word.toLowerCase()) || m.content.toLowerCase() === word.toLowerCase(), { time: 30000, max: 1 });

                this.timeout = setTimeout(() => {
                    const embedDica = new this.client.embed()
                        .setAuthor('DICA!', 'https://cdn.discordapp.com/emojis/758833296216948776.png?v=1')
                        .setDescription(`${word.split("").map(str => specialCodes[str] ? /[a-z]/gi.test(str) ? `:regional_indicator_${specialCodes[str]}:` : specialCodes[str] : `:regional_indicator_${str}:`).slice(0, 3).join("") + '...'}`);

                    this.message.quote(embedDica)
                }, 20000)

                this.collector.on('collect', async (collected) => {
                    if (!this.users.has(collected.author.id)) this.users.set(collected.author.id, {
                        id: collected.author.id,
                        points: 1
                    });
                    else this.users.get(collected.author.id).points += 1;

                    collected.react('✅');

                    await collected.quote(t('commands:anagrama.point', { member: collected.author.id }));

                    setTimeout(async () => {

                        const medals = {
                            0: '🥇',
                            1: '🥈',
                            2: '🥉',
                        };

                        const embedRanking = new this.client.embed()
                            .setAuthor('Ranking', 'https://cdn.discordapp.com/emojis/815381545270771724.png?v=1')
                            .setDescription(this.users.array().sort((a, b) => b.points - a.points).slice(0, 3).map((u, indice) => `${medals[indice]} - <@${u.id}> \`(${u.points})\` `))

                        await this.message.quote(embedRanking);

                        setTimeout(() => {
                            this.playNew()
                        }, 3000)
                    }, 10000)

                })

                this.collector.on('end', async (_, reason) => {

                    clearTimeout(this.timeout);

                    if (reason !== 'limit') {

                        const medals = {
                            0: '🥇',
                            1: '🥈',
                            2: '🥉',
                        };

                        const embedRanking = new this.client.embed()
                            .setAuthor(t('commands:anagrama.authorEnd'), 'https://cdn.discordapp.com/emojis/815381545270771724.png?v=1')
                            .setDescription(t('commands:anagrama.descEnd', { word }) + this.users.array().sort((a, b) => b.points - a.points).slice(0, 3).map((u, indice) => `${medals[indice]} - <@${u.id}> \`(${u.points})\` `).join("\n"))

                        await this.message.quote(embedRanking);

                        this.client.games.anagrama.delete(this.message.channel.id)
                    }
                })
            })
        })
    }
}
