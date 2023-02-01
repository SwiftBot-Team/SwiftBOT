const Command = require('../../services/Command')

const { Collection } = require('discord.js');

const avatars = [
    'https://tilomitra.com/wp-content/uploads/2014/08/avatar-cartoon.png',
    'https://cdn.pixabay.com/photo/2017/01/31/19/07/avatar-2026510_1280.png',
    'https://img.favpng.com/25/7/23/computer-icons-user-profile-avatar-image-png-favpng-LFqDyLRhe3PBXM0sx2LufsGFU.jpg'
];

const UnoGame = require('../../services/UnoGame.js');

class Uno extends Command {
    constructor(client) {
        super(client, {
            name: 'uno',
            aliases: [],
            description: "descriptions:uno",
            category: "categories:games",
            devsOnly: true
        })

    }


    async run({ message, args, prefix, games }, t) {

        let game = games.uno.get(message.channel.id);

        if (!args[0]) return message.respond('\`sw!uno criar\` ou \`sw!uno entrar\` ')

        if (['entrar', 'join'].includes(args[0].toLowerCase())) {

            if (!game) return message.respond('Não tem nenhum jogo em andamento. Use \`sw!uno criar\` para criar uma sala.');
            if (game.running) return message.respond('A partida já começou.')

            if (game.users.get(message.author.id)) return message.respond(`Você já está na partida.`);

            game.users.set(message.author.id, {
                id: message.author.id,
                cards: [],
                user: message.author
            })

            this.client.api.channels[game.channel.id]['thread-members'][message.author.id].put({ data: message.author.id })
                .then(() => game.send(`${message.author} entrou na partida.`))

            message.respond(`${message.author} entrou na partida (${game.users.size} jogadores).`);
        }

        if (['create', 'criar', 'spawn'].includes(args[0].toLowerCase())) {

            if (game) return message.respond('Já existe um jogo no momento. `Use sw!uno entrar`.');

            message.respond('Partida crida com sucesso. Para iniciá-lo, use `sw!uno iniciar` (minimo 4 jogadores)');

            this.client.api.channels[message.channel.id].threads.post({
                data: {
                    name: 'Sala de uno 1',
                    type: 11,
                    auto_archive_duration: 60
                }
            }).then(channel => {

                game = new UnoGame(this.client, message, channel.id);

                game.users.set(message.author.id, {
                    id: message.author.id,
                    cards: [],
                    user: message.author
                });

                this.client.games.uno.set(message.channel.id, game);

                this.client.api.channels[channel.id]['thread-members'][message.author.id].put({ data: message.author.id })
                    .then(() => game.send(`${message.author} entrou na partida.`))
            })
        }

        if (['cancelar'].includes(args[0].toLowerCase())) {
            if (!game) return message.respond('Não há nenhum jogo em espera.');

            if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id !== game.owner) return message.respond(`Apenas o dono da partida ou alguém com permissão acima de \`GERENCIAR_SERVIDOR\` pode cancelar uma partida. `)

            if (game.running) return message.respond('A partida já foi iniciada.');

            this.client.games.uno.delete(message.channel.id);

            message.respond('Cancelado com sucesso.')
        }

        if (['leave', 'sair', 'exit'].includes(args[0].toLowerCase())) {
            if (!game) return message.respond('Não há nenhum jogo em espera.');

            if (!game.users.find(u => u.id === message.author.id)) return message.respond('Você não está participando do jogo atual.');

            if (game.owner === message.author.id) {
                if (game.users.size === 1) {
                    this.client.games.uno.delete(message.channel.id);

                    message.respond('Você saiu do jogo com sucesso e o mesmo foi cancelado por você ser o único na sala.')
                } else {

                    game.users.delete(message.author.id);

                    game.owner = game.users.random().id;

                    message.respond('Você saiu do jogo com sucesso. A posse da sala foi passada para um jogador aleatório').then(msg => {
                        return message.respond(`O novo mestre do jogo é <@${game.owner}>`);
                    })
                }
            } else {

                game.users.delete(message.author.id);

                return message.respond('Você saiu do jogo com sucesso.');
            }
        }

        if (['start', 'iniciar'].includes(args[0].toLowerCase())) {

            if (!game) return message.respond('Não há nenhum jogo em espera.');

            if (game.owner !== message.author.id) return message.respond('Apenas o criador da sala pode iniciar a partida.');

            if (game.running) return message.respond('A partida já foi iniciada.');

            //if (game.users.size < 4) return message.respond('São necessários no mínimo 4 jogadores para iniciar uma partida.')

            game.running = true;

            game.start()

        }
    }
}

module.exports = Uno
