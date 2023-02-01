const Base = require("../../services/Command");

module.exports = class akinator extends Base {
	constructor(client) {
		super(client, {
			name: 'akinator',
			aliases: [],
			cooldown: 10000,
			description: "descriptions:akinator",
			category: "categories:games",
		})
	}

	async run({ message, args, prefix, games }) {

		const { Aki } = require('aki-api');

		const game = this.client.games.akinator.get(message.author.id)?.game || new Aki('pt');

		if (!this.client.games.akinator.get(message.author.id)) this.client.games.akinator.set(message.author.id, { game });

		const waiting = await message.respond('Iniciando partida. Aguarde...');

		await game.start();

		waiting.delete({ timeout: 1000 })

		const play = async () => {

			const msg = await message.channel.send(`**Pergunta nº ${game.currentStep + 1}.** \`${game.question}\` **(${Math.floor(game.progress)}%)**
			Respostas disponíveis: ${game.answers.map(s => s).join(" | ")}`);

			const collector = msg.channel.createMessageCollector(m => game.answers.map(s => s.toLowerCase()).includes(m.content.toLowerCase()) && m.author.id === message.author.id, { max: 1, time: 15000 })

				.on('collect', async ({ content }) => {

					try {
						const step = await game.step(game.answers.indexOf(content));

						if (game.currentStep >= 100) {
							message.respond('Ahh, eu perdi, não consegui advinhar quem é seu personagem.. Sinto muito.');

							return this.client.games.akinator.delete(message.author.id);
						}

						if (game.progress >= Number(80) && !this.client.games.akinator.get(message.author.id).cooldown) {
							const verify = await game.win();

							const embed = new this.client.embed(this.client.user)
								.setDescription(`Acho que estou perto, pois estou com ${Math.floor(game.progress)}% de certeza!
					
					Seu personagem é ${game.answers[0].name}?
					${" ".repeat(17)} ${game.answers[0].description}
					
					Responda com \`sim\` ou \`não\` para continuar. `)
								.setThumbnail(game.answers[0].absolute_picture_path)
								.setFooter('Swift - Akinator', this.client.user.displayAvatarURL())

							message.channel.send(embed);

							const secondCollector = msg.channel.createMessageCollector(m => ['sim', 'não'].includes(m.content.toLowerCase()) && m.author.id === message.author.id, { max: 1 })

							secondCollector.on('collect', async (collected) => {
								if (collected.content.toLowerCase() === 'sim') {
									await message.respond('YAY! Acertei seu personagem, que legal!');

									this.client.games.akinator.delete(message.author.id);

								} else {
									this.client.games.akinator.get(message.author.id).cooldown = 7;

									await game.step();

									play();
								}
							})

							secondCollector.on('end', async (_, endReason) => {
								if (endReason !== 'limit') {
									message.respond('Você não me respondeu, o que quer dizer que eu venci! GG!');

									this.client.games.akinator.delete(message.author.id);
								}
							})
						} else {
							if (this.client.games.akinator.get(message.author.id).cooldown) this.client.games.akinator.get(message.author.id).cooldown -= 1;

							play();
						}
					} catch (err) {

						this.client.games.akinator.delete(message.author.id);

						if (err.message.includes('WARN - NO QUESTION')) {
							return message.respond(`Ahh, eu perdi, não consegui advinhar quem é seu personagem.. Sinto muito.`);

						} else {
							return message.respond(`Ocorreu um erro, sinto muito.`);
						}
					}
				})

				.on('end', async (c, reason) => {
					if (reason !== 'limit') {
						message.respond('Você não me respondeu, o que quer dizer que eu venci! GG!');

						this.client.games.akinator.delete(message.author.id);
					}
				})
		}

		play();
	}
}
