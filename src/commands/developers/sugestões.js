const { stdTransformDependencies } = require("mathjs");
const Base = require("../../services/Command");

class Sugestões extends Base {
    constructor(client) {
        super(client, {
            name: "sugestões",
            description: "descriptions:sugestões",
            category: "categories:devs",
            cooldown: 1000,
            aliases: [],
            devsOnly: true,
            hidden: true
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return message.respond(`Você deve inserir o que deseja fazr! [aceitar|negar]`);

        if (!['aceitar', 'negar'].includes(args[0].toLowerCase())) return message.respond('Opção inválida.');

        if (!args[1]) return message.respond('Você deve inserir o ID da mensagem da sugestão!');

        const status = {
            aceitar: 'ACEITA',
            negar: 'NEGADA'
        };

        const sugMessage = await this.client.channels.cache.get('795783489969979442').messages.fetch(args[1]).catch(err => { return })

        if (!sugMessage) return message.respond('Não foi possível encontrar esta mensagem.')

        const msg = await message.respond('Deseja colocar uma respota na sugestão? Se sim, diga a resposta. Se não, digite `não` **(2 minutos)**',
            false,
            { footer: 'Para cancelar, digite "cancelar"' });

        const collector = msg.channel.createMessageCollector(m => m.author.id === message.author.id, { max: 1, time: 60000 * 2 });

        collector.on('collect', async ({ content }) => {

            if (['cancelar', 'cancel', 'cancelar.'].some(response => content === response)) return message.respond('Operação cancelada com sucesso.');

            const refMessage = await this.client.database.ref(`SwiftBOT/sugestões/messages/${sugMessage.id}`).once('value').then(db => db.val());

            const ref = await this.client.database.ref(`SwiftBOT/sugestões/users/${refMessage.author}`).once('value').then(db => db.val());

            if (!ref) return message.respond('Ocorreu um erro e não pude encontrar a sugestão.');

            const suggestion = ref.find(s => s.message === args[1]);

            const autor = this.client.users.cache.get(refMessage.author);

            autor.send(new this.client.embed().setDescription(`${autor}, sua sugestão acaba de ser ${status[args[0]]}. Para ver o status dela, basta utilizar o comando ${this.client.user} mysuggestions.`)).catch(err => err);

            const embed = new this.client.embed()
                .setAuthor(`Sugestão enviada por ${autor.tag}`, this.client.user.displayAvatarURL())
                .setDescription(`\`\`\`\n${suggestion.sugestão}\`\`\` `)
                .setFooter(`Status da sugestão: ${status[args[0]]}`, this.client.user.displayAvatarURL());

            sugMessage.edit(embed);

            message.respond('Ação executada com sucesso.');

            ref[ref.indexOf(ref.find(s => s.message === args[1]))] = {
                ...suggestion,
                status: status[args[0]],
                response: ['não', 'não.', 'n', 'n.'].some(response => content === response) ? 'Sem resposta' : content
            };

            this.client.database.ref(`SwiftBOT/sugestões/users/${autor.id}`).set(ref);
        })
    }
}

module.exports = Sugestões