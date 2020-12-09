const Base = require("../../services/Command");

class Kiss extends Base {
    constructor(client) {
        super(client, {
            name: "kiss",
            description: "descriptions:kiss",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["beijar", 'kiss'],
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return message.channel.send(new this.client.embed().setDescription(t('commands:kiss.no_user', { member: message.author.id })));

        const user = await this.getUsers()[0];

        if (!user) return message.channel.send(new this.client.embed().setDescription(t('commands:kiss.no_found', { member: message.author.id })));

        const kiss = async (user1, user2) => {

            const { KSoftClient } = require('@ksoft/api');

            const ksoft = new KSoftClient(process.env.KSOFT_API);

            const { url } = await ksoft.images.random('kiss', { nsfw: false });

            message.channel.send(new this.client.embed()
                .setAuthor(t('commands:kiss.author'), 'https://cdn.discordapp.com/emojis/703725149312122982.png?v=1')
                .setDescription(`${user1} ${t('commands:kiss.kiss')} ${user2}!`)
                .setImage(url)
                .setFooter(t('commands:kiss.author'), 'https://cdn.discordapp.com/emojis/703725149312122982.png?v=1')).then(async msg => {
                    msg.react("🔁")
                    msg.createReactionCollector((r, u) => r.emoji.name === '🔁' && u.id === user2.user.id, { max: 1, time: 60000 * 10 })
                        .on('collect', async (r, u) => {
                            return kiss(user2, user1)
                        })
                })
        };


        kiss(message.member, user)

    }
}
module.exports = Kiss;