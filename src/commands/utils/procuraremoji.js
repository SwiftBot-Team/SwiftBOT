const Base = require("../../services/Command");
const Discord = require('discord.js')

class Procuraremoji extends Base {
    constructor(client) {
        super(client, {
            name: "procuraremoji",
            description: "descriptions:procuraremoji",
            category: "categories:utils",
            cooldown: 1000,
            aliases: ['search-emoji']
        })
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return this.respond('insere algum nome pra eu procurar');

        const emojis = this.client.emojis.cache.filter(c => c.name.toLowerCase().includes(args.slice(0).join(" ").toLowerCase()));

        if (!emojis.size) return this.respond('n achei nenhum emojo');

        const validEmojis = emojis.array().splice(0, 10);

        console.log(emojis.map(e => e.toString()))

        const embed = new this.client.embed()
            .setDescription(validEmojis.map(e => e.toString()).join(' '))
            .setFooter('Reaja abaixo para adicionaro emoji (requer permissão MANAGE_EMOJIS)')

        message.channel.send(embed).then(msg => {

            validEmojis.map(e => msg.react(e.id));

            msg.createReactionCollector((r, u) => validEmojis.map(e => e.id).includes(r.emoji.id) && u.id === message.author.id, { max: 1, time: 60000 })

                .on('collect', async ({ emoji }) => {

                    if (!message.member.permissions.has('MANAGE_EMOJIS')) return this.respond('Não foi possível adicionar o emoji por você não possuir a permissão MANAGE_EMOJIS')

                    message.guild.emojis.create(emoji.animated ? `https://cdn.discordapp.com/emojis/${emoji.id}.gif?v=1` : `https://cdn.discordapp.com/emojis/${emoji.id}.png?v=1`, emoji.name);

                    this.respond('Emoji adicionado com sucesso.')
                })
        })
    }
}
module.exports = Procuraremoji;