const Base = require("../../services/Command");

const Game = require('../../services/connectService.js');

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

module.exports = class Connect4 extends Base {
	constructor(client) {
		super(client, {
			name: 'connect4',
			aliases: ['connectfour', 'play-connect4', 'jogar-connect4', 'connect'],
			cooldown: 5500,
			channel_permissions: ['ADD_REACTIONS'],
			category: "categories:games",
		})
	}

	async run({ message, args, prefix }) {
		const user = await this.getUsers()[0]

		if (!user) return message.respond('Você precisa inserir um usuário para jogar!');

		if (this.client.games.connect4.get(message.author.id)) return message.respond('Você já está jogando connect4 no momento.');

		if (this.client.games.connect4.get(user.id)) return message.respond(`Este jogador já está jogando connect4 com outra pessoa.`);

		if (!args[1]) return message.respond(`${message.author}, você precisa inserir o tamanho do tabuleiro. Mínimo 5 e máximo 8!`)

		if (isNaN(args[1])) return message.respond(`${message.author}, o número precisa ser um número!`);

		let size = Math.floor(Number(args[1]));

		if (size < 5 || size > 8) return message.respond(`${message.author}, por favor, insira um número maior que 4 e menor que 9!`);

		const users = {
			autor: {
				user: message.author,
				color: 'red'
			},
			other: {
				user: user.user || user,
				color: 'yellow'
			}
		};

		const connect = new Game(size, user.id === this.client.user.id ? ['red', 'yellow'] : false);

		const msg = await message.channel.send('Carregando tabuleiro...');

		const play = async (msg, user) => {
			if (user.user.id !== this.client.user.id) {

				const collector = msg.createReactionCollector((r, u) => emojis.includes(r.emoji.name) && u.id === user.user.id, { max: 1, time: 120000 })

					.on('collect', async (reaction, u) => {

						if (message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) reaction.users.remove(u.id);

						const { emoji } = reaction;

						const usedNumber = emojis.indexOf(emoji.name);

						const verify = await connect.play(user.color, usedNumber, true);

						if (typeof verify === 'string') {
							setTimeout(() => play(msg, user), 1500);

							return message.respond(`${user.user}, esta casa está ocupada!`).then(e => e.delete({ timeout: 5000 }))
						}

						if (typeof verify === 'object') {

							msg.edit(await this.handleBoard(connect.board, user.color === 'red' ? users.other.color : users.autor.color));

							return message.respond(`${user.user} ganhou! **(${user.color})**`);
						}

						if (!connect.board.filter(board => board.find(e => e === 'x') !== undefined).length) {

							msg.edit(await this.handleBoard(connect.board, user.color));

							return message.respond('O jogo empatou!');
						}

						msg.edit(await this.handleBoard(connect.board, user.color === 'red' ? users.other.color : users.autor.color))

						setTimeout(() => play(msg, user.color === 'red' ? users.other : users.autor), 1500);
					})

					.on('end', async (_, reason) => {
						if (reason !== 'limit') return message.respond('O jogo foi cancelado por inatividade de um dos jogadores.');
					})
			} else {
				setTimeout(async () => {
					const movement = await connect.getIAMovement();

					console.log(movement)
				}, 2000)
			}
		}

		for (let i = 0; i < emojis.slice(0, connect.board.length - 1).length; i++) {

			msg.react(emojis[i]).then(async () => {
				if (i === emojis.slice(0, connect.board.length - 1).length - 1) {
					await msg.edit(await this.handleBoard(connect.board, users['autor'].color));

					await play(msg, users['autor']);
				}
			})
		}
	}

	async handleBoard(board, color) {

		const emojisBoard = {
			'red': '🔴',
			'white': '⚪',
			'yellow': '🟡'
		};

		let msg = emojisBoard[color] + '\n\n' + emojis.slice(0, board.length - 1).join("") + "\n";

		for (var i = 0; i < board.length; i++) {
			msg += board[i].map(e => e !== 'x' ? emojisBoard[e] : emojisBoard.white).join("") + "\n"
		};

		return msg
	}
}
