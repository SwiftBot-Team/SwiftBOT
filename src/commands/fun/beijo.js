const Base = require("../../services/Command");

class Kiss extends Base {
    constructor(client) {
        super(client, {
            name: "kiss",
            description: "descriptions.kiss",
            category: "categories.fun",
            cooldown: 1000,
            aliases: ["beijar", 'kiss'],
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return message.channel.send(new this.client.embed().setDescription(t('commands:kiss.no_user', {member: message.author.id})));
      
        let user = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => m.user.username.toLowerCase() === args[0].toLowerCase()) || message.guild.members.cache.find(m => m.nickname === args[0]);
        
        if (!user) return message.channel.send(new this.client.embed().setDescription(t('commands:kiss.no_found', {member: message.author.id})));

        const imgs = [
            'https://media2.giphy.com/media/G3va31oEEnIkM/giphy.gif',
            'https://media1.tenor.com/images/f5167c56b1cca2814f9eca99c4f4fab8/tenor.gif?itemid=6155657',
            'https://media.tenor.com/images/fbb2b4d5c673ffcf8ec35e4652084c2a/tenor.gif',
            'https://media.giphy.com/media/ZRSGWtBJG4Tza/giphy.gif',
            'https://media.giphy.com/media/oHZPerDaubltu/giphy.gif',
            'https://acegif.com/wp-content/uploads/anime-kiss-m.gif',
            'https://media.giphy.com/media/bm2O3nXTcKJeU/giphy.gif',
            'https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif',
            'https://media0.giphy.com/media/KH1CTZtw1iP3W/source.gif'
        ];

        const kiss = (user1, user2) => {
            message.channel.send(new this.client.embed()
                .setAuthor(t('commands:kiss.author'), 'https://cdn.discordapp.com/emojis/703725149312122982.png?v=1')
                .setDescription(`${user1} ${t('commands:kiss.kiss')} ${user2}!`)
                .setImage(imgs[Math.floor(Math.random() * imgs.length)])
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