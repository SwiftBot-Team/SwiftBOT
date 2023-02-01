const Base = require("../../services/Command");

class Sugerir extends Base {
    constructor(client) {
        super(client, {
            name: "sugerir",
            description: "descriptions:sugerir",
            category: "categories:utils",
            cooldown: 1000,
            aliases: ['sug', 'sugest']
        })
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return message.respond('Você deve inserir a sugestão!');

        if (args[0].length > 1500) return message.respond('Sua sugestão é grande demais!')

        message.respond('Sugestão enviada com sucesso.');

        const embed = new this.client.embed()
            .setAuthor(`Sugestão enviada por ${message.author.tag}`, this.client.user.displayAvatarURL())
            .setDescription(`\`\`\`\n${args.slice(0).join(" ")}\`\`\` `)
            .setFooter('Status da sugestão: ANÁLISE', this.client.user.displayAvatarURL());

        const msg = await this.client.channels.cache.get('795783489969979442').send(embed);

        const ref = await this.client.database.ref(`SwiftBOT/sugestões/users/${message.author.id}`).once('value').then(d => d.val() || [])

        await this.client.database.ref(`SwiftBOT/sugestões/users/${message.author.id}`)
            .set([...ref, {
                sugestão: args.slice(0).join(" "),
                status: 'ANÁLISE',
                message: msg.id,
                date: new Date().toLocaleString('pt-br', { timeZone: 'America/Sao_Paulo' })
            }])

        this.client.database.ref(`SwiftBOT/sugestões/messages/${msg.id}`).set({
            author: message.author.id
        })


    }
}
module.exports = Sugerir;