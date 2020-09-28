const Command = require('../../services/Command')

class Slap extends Command {
    constructor(client) {
        super(client, {
            name: 'slap',
            aliases: ['tapa', 'bater', 'socar', 'soco'],
            description: "descriptions:slap",
            category: "categories:fun",
        })
    }


    async run({ message, args, prefix }, t) {

        if (!args[0]) return this.respond(t('commands:slap.noArgs', { member: message.author.id }));

        const slappedUser = await this.getUsers()[0];

        if (!slappedUser) return this.respond(t('commands:slap.noFoundUser', { user: args[0] }));

        const slapFunction = async (user1, user2) => {

            const img = await fetch('https://nekos.life/api/v2/img/slap').then(res => res.json());

            const embed = new this.client.embed()
                .setDescription(t('commands:slap.author', { user1: user1.user.id, user2: user2.user.id }), this.client.user.displayAvatarURL())
                .setImage(img.url)

            return this.message.channel.send(embed).then(msg => {
                msg.react("🔁");

                msg.createReactionCollector((r, u) => r.emoji.name === '🔁' && u.id === user2.user.id, { max: 1 })
                    .on('collect', () => {
                        slapFunction(user2, user1);
                    });
            });
        };

        slapFunction(message.member, slappedUser);
    }
}

module.exports = Slap;