const Command = require('../../services/Command.js');

module.exports = class Inviteinfo extends Command {
	constructor(client) {
		super(client, {
			name: 'inviteinfo',
			aliases: [],
			cooldown: 10000,
			category: 'categories:utils'
		})
	}

	async run({ message, args, member }) {

		if (!args[0]) return message.respond(`Você precisa inserir o invite ou código que deseja procurar!`);

		this.client.fetchInvite(args[0]).then(async invite => {

			if (message.deletable) message.delete({ timeout: 0 });

			const embed = new this.client.embed()
				.setAuthor(invite.guild.name, invite.guild.iconURL({ size: 4096, dynamic: true }))
				.setThumbnail(invite.guild.iconURL({ size: 4096, dynamic: true }), true)
				.addField('Inviter', `**${invite.inviter?.tag || 'desconhecido'}** \`(${invite.inviter.id})\` `)
				.addField('Quantidade de membros', `\`${invite.memberCount}\` membros`, true)
				.addField('Canal', `\`${invite.channel.name}\``, true);

			invite.guild.bannerURL() ? embed.setImage(invite.guild.bannerURL({ size: 4096, format: 'png' })) : false;

			message.quote(embed);

		}, () => message.respond('Por favor, insira um invite válido.'))
	}
}
