const Command = require('../../services/Command')

class Werewolf extends Command {
    constructor(client) {
        super(client, {
            name: 'werewolf',
            aliases: ['lobisomem'],
            description: "descriptions:werewolf",
            category: "categories:fun",
            devsOnly: true
        })

        this.defaultGameConfig = {
            workers: {
                Aldeão: {
                    users: [],
                    habilidades: [],
                    usersSize: 1
                },
                Lobisomem: {
                    users: [],
                    habilidades: ['matar'],
                    usersSize: 1
                },
                Bruxa: {
                    users: [],
                    habilidades: ['envenenar', 'curar'],
                    usersize: 1
                }
            },
            usersDead: [],
            usersAlive: []
        }
    }


    async run({ message, args, prefix, games }, t) {

        const game = games.werewolf.get(message.guild.id);

        if (!args[0]) return this.respond('sw!werewolf criar ou sw!werewolf entrar')

        if (['entrar', 'join'].includes(args[0].toLowerCase())) {
            if (!game) return this.respond('Não tem nenhum jogo em andamento. Use \`sw!werewolf criar\` para criar uma sala.');
        }

        if (['create', 'criar', 'spawn'].includes(args[0].toLowerCase())) {
            this.client.games.werewolf.set(message.guild.id, {
                ...this.defaultGameConfig,
                channel: message.channel.id,
                users: [message.author.id]
            });

            this.respond('partida crida com sucesso.');
        }
    }
}

module.exports = Werewolf