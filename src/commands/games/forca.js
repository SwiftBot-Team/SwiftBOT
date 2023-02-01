const Base = require("../../services/Command");

const request = require('request');

const { JSDOM } = require('jsdom');

class Forca extends Base {
	constructor(client) {
		super(client, {
			name: "forca",
			description: "descriptions:forca",
			category: "categories:games",
			cooldown: 10000,
			aliases: [],
			permissions: [],
			channel_permissions: ['ADD_REACTIONS'],
			hidden: false,
		});
	}

	async run({ message, args, prefix }, t) {

		if (this.client.games.forca.get(message.author.id)) return message.respond(`Você já possui um jogo da forca em andamento. Vá ao chat e digite 'cancelar' para cancelra o mesmo. `);

		this.client.games.forca.set(message.author.id, true);

		request('https://www.palabrasaleatorias.com/palavras-aleatorias.php/', (err, res) => {
			const dom = new JSDOM(res.body);

			const word = dom.window.document.querySelector("table div").innerHTML.toLowerCase().replace('\n', '');

			const used = [];

			const allowedChar = 'abcdefghijklmnopqrstuvwxyz'.split("");

			const fullBoard = [['O'], ['\\', '—', `/`], ['/', '\\']];

			const board = [[null], [null, null, null], [null, null]]

			const play = async (msg, index) => {

				let formated = word.split("").map(c => used.includes(c.toLowerCase()) ? c : '_ ').join("")
				const toEdit = `
					----------------
					|         |
					|        ${board[0][0] || ''}
					|     ${board[1].map(e => e || '').join(" ")}
                    |      ${board[2].map(e => e || ' ').join("    ")}
					===========`;

				if (msg && index < 6) msg.edit(`Letras já usadas: ${used.length ? used.map(u => `\`${u}\` `).join(", ") : 'Nenhuma'}\nPalavra: \`${formated}\` \n${toEdit}`)
				else {
					if (msg) await msg.delete({ timeout: 0 });

					msg = await message.quote(`Letras já usadas: ${used.length ? used.map(u => `\`${u}\` `).join(", ") : 'Nenhuma'}\nPalavra: \`${formated}\` \n${toEdit}`);
				}

				msg.channel.createMessageCollector((m => m.author.id === message.author.id && (allowedChar.some(c => !used.includes(c) && c === m.content.toLowerCase()) || ['cancelar', 'cancel'].includes(m.content.toLowerCase()) || m.content.toLowerCase() === word.toLowerCase())), { max: 1, time: 60000 })

					.on('collect', async (collected) => {

						if (['cancel', 'cancelar'].some(e => e === collected.content.toLowerCase())) {

							this.client.games.forca.delete(message.author.id);

							return message.respond('Jogo cancelado com sucesso.')
						};

						used.push(collected.content.toLowerCase());

						formated = word.split("").map(c => used.includes(c.toLowerCase()) ? c : '_ ').join("");

						if (formated.toLowerCase() == word.toLowerCase() || collected.content.toLowerCase() === word.toLowerCase()) {
							this.client.games.forca.delete(message.author.id);

							collected.react('✅');

							board[0] = ['😀'];

							if (collected.content.toLowerCase() === word.toLowerCase()) used = word.split("");

							await msg.edit(toEdit);

							return message.respond(`Você acertou a mensagem! Mensagem: \`${word}\` `)
						};

						if (word.toLowerCase().includes(collected.content.toLowerCase())) collected.react('✅')
						else {
							collected.react('❌');

							for (let i = 0; i < board.length; i++) {
								const fil = board[i].filter(e => e === null);

								if (!fil.length) {
									if (i === board.length - 1) {

										this.client.games.forca.delete(message.author.id);

										board[0] = ['😵'];

										await msg.edit(toEdit);

										return message.respond(`Você perdeu! A palavra era: **${word}**`)
									}

									continue;
								}

								for (let y = 0; y < fullBoard[i].length; y++) {
									if (board[i][y]) continue;

									if (i === board.length - 1 && y === fullBoard[i].length - 1 && board[i][y] === fullBoard[i][y]) {

										this.client.games.forca.delete(message.author.id);

										board[0] = ['😵'];

										await msg.edit(toEdit);

										return message.respond(`Você perdeu! A palavra era: **${word}**`)
									}

									board[i][y] = fullBoard[i][y];

									break;
								};

								break;
							}
						}

						if (index >= 6) index = 0;

						++index;

						setTimeout(() => play(msg, index), 1200)
					})

					.on('end', async (_, reason) => {

						if (reason !== 'limit') {
							this.client.games.forca.delete(message.author.id);

							board[0] = ['😵'];

							msg.edit(toEdit);

							return message.respond(`Você demorou demais para responder e o jogo foi cancelado.`)
						}
					})


			};

			play(false, 1)
		})

	}
}

module.exports = Forca
