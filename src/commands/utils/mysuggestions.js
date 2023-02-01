const Base = require("../../services/Command");

class Mysuggestions extends Base {
    constructor(client) {
        super(client, {
            name: "mysuggestions",
            description: "descriptions:mysuggestions",
            category: "categories:utils",
            cooldown: 1000,
            aliases: ['minhassugestões', 'msg']
        })
    }

    async run({ message, args, prefix }, t) {

        const ref = await this.client.database.ref(`SwiftBOT/sugestões/users/${message.author.id}`).once('value').then(db => db.val());

        if (!ref) return message.respond('Você não possui nenhuma sugestão.');

        let index = -1;

        const send = async (msg) => {

            index++;

            const suggestion = ref[index];

            const embed = new this.client.embed()
                .setAuthor(`Sugestão enviada no dia ${suggestion.date}`, this.client.user.displayAvatarURL())
                .setDescription(`**Status da sugestao:** \`${suggestion.status}\`
            ${suggestion.response ? `**Resposta da equipe de desenvolvimento:** \`${suggestion.response}\` ` : ''}
            \n**Sugestão:**\`\`\`\n\n${suggestion.sugestão}\`\`\` `)
                .setFooter(`Sugestão ${index + 1}/${ref.length}`, this.client.user.displayAvatarURL());

            msg = await (msg ? await msg.edit(embed) : await message.channel.send(embed))

            const emojis = ['⬅️', '➡️'];

            emojis.map(async e => await msg.react(e));

            const collector = msg.createReactionCollector((r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id);

            collector.on('collect', async ({ emoji }) => {
                switch (emoji.name) {
                    case '⬅️':
                        if (index === 0) return;

                        index -= 2;

                        await send(msg);

                        collector.stop('user')

                        break;

                    case '➡️':
                        if (index === ref.length - 1) return;

                        await send(msg);

                        collector.stop('user')
                }
            })

        }

        send(false);
    }
}
module.exports = Mysuggestions;