const Command = require('../../services/Command')

const avatars = [
    'https://tilomitra.com/wp-content/uploads/2014/08/avatar-cartoon.png',
    'https://cdn.pixabay.com/photo/2017/01/31/19/07/avatar-2026510_1280.png',
    'https://img.favpng.com/25/7/23/computer-icons-user-profile-avatar-image-png-favpng-LFqDyLRhe3PBXM0sx2LufsGFU.jpg'
];

class Werewolf extends Command {
    constructor(client) {
        super(client, {
            name: 'werewolf',
            aliases: ['lobisomem'],
            description: "descriptions:werewolf",
            category: "categories:fun",
            devsOnly: false
        })

        this.defaultGameConfig = {
            workers: [
                {
                    name: 'Aldeão',
                    users: [],
                    habilidades: [],
                    usersSize: 1,
                    priority: 0,
                    description: 'a',
                    image: 'a'
                },
                {
                    name: "Vidente",
                    users: [],
                    habilidades: [{
                        name: 'Ver a classe de outro jogador',
                        emoji: '794932222293311498',
                        special: (user, message, game, affetedUser) => {
                            return user.send(`O trabalho do usuário é: **${affetedUser.worker.name}**!`);
                        }
                    }],
                    usersSize: 1,
                    priority: 0,
                    description: 'a',
                    image: 'a',
                },
                {
                    name: 'Caçador',
                    users: [],
                    habilidades: [{
                        name: 'matar',
                        emoji: '🏹'
                    }]
                },
                {
                    name: 'Lobisomem',
                    users: [],
                    habilidades: [{
                        name: 'matar',
                        emoji: '💀'
                    }],
                    usersSize: 1,
                    priority: 1,
                    description: 'a',
                    image: 'a'
                },
                {
                    name: 'Bruxa',
                    users: [],
                    habilidades: [{
                        name: 'envenenar',
                        emoji: '💀'
                    }, {
                        name: 'curar',
                        emoji: '💊'
                    }],
                    usersSize: 1,
                    priority: 0,
                    description: 'a',
                    image: 'a'
                },
                {
                    name: 'Médico',
                    users: [],
                    habilidades: [{
                        name: 'curar',
                        emoji: '💊'
                    }],
                    usersSize: 1,
                    priority: 0,
                    description: 'a',
                    image: 'a'
                }
            ],
            usersDead: [],
            usersAlive: [],
            actions: [],
            votes: [],
            day: 0,
            night: 0,
            time: {
                atual: 'night',
                types: ['night', 'day']
            },
            running: false
        }
    }


    async run({ message, args, prefix, games }, t) {

        const game = games.werewolf.get(message.channel.id);

        if (!args[0]) return this.respond('\`sw!werewolf criar\` ou \`sw!werewolf entrar\` ')

        if (['entrar', 'join'].includes(args[0].toLowerCase())) {

            if (!game) return this.respond('Não tem nenhum jogo em andamento. Use \`sw!werewolf criar\` para criar uma sala.');
            if (game.running) return this.respond('A partida já começou.')

            if (game.users.find(u => u.id === message.author.id)) return this.respond(`Você já está na partida.`);

            game.users.push({
                id: message.author.id,
                worker: null,
                avatar: avatars[Math.floor(Math.random() * avatars.length)]
            });

            this.respond(`${message.author} entrou na partida. Por favor, mantenha suas mensagens privadas habilitadas! (${game.users.length} jogadores).`)
        }

        if (['create', 'criar', 'spawn'].includes(args[0].toLowerCase())) {

            if (game) return this.respond('Já existe um jogo no momento. `Use sw!werewolf entrar`.');

            this.client.games.werewolf.set(message.channel.id, {
                ...this.defaultGameConfig,
                channel: message.channel.id,
                users: [{
                    id: message.author.id,
                    worker: null,
                    avatar: avatars[Math.floor(Math.random() * avatars.length)]
                }],
                owner: message.author.id
            });

            this.respond('Partida crida com sucesso. Para iniciá-lo, use `sw!werewolf iniciar` (minimo 4 jogadores)');
        }

        if (['cancelar'].includes(args[0].toLowerCase())) {
            if (!game) return this.respond('Não há nenhum jogo em espera.');

            if (!message.member.hasPermission('MANAGE_GUILD') && message.author.id !== game.owner) return this.respond(`Apenas o dono da partida ou alguém com permissão acima de \`GERENCIAR_SERVIDOR\` pode cancelar uma partida. `)

            if (game.running) return this.respond('A partida já foi iniciada.');

            this.client.games.werewolf.delete(message.channel.id);
            this.respond('Cancelado com sucesso.')
        }

        if (['leave', 'sair', 'exit'].includes(args[0].toLowerCase())) {
            if (!game) return this.respond('Não há nenhum jogo em espera.');

            if (!game.users.find(u => u.id === message.author.id)) return this.respond('Você não está participando do jogo atual.');

            if (game.owner === message.author.id) {
                if (game.users.length === 1) {
                    this.client.games.werewolf.delete(message.channel.id);

                    this.respond('Você saiu do jogo com sucesso e o mesmo foi cancelado por você ser o único na sala.')
                } else {
                    const user = game.users.indexOf(game.users.find(u => u.id === message.author.id));

                    game.users.splice(game.users.indexOf(user), 1);

                    const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === user.worker.name))];

                    game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(user.id), 1);

                    game.owner = game.users[Math.floor(Math.random() * game.users.length)].id;

                    this.respond('Você saiu do jogo com sucesso. A posse da sala foi passada para um jogador aleatório').then(msg => {
                        return msg.channel.send(`O novo mestre do jogo é <@${game.owner}>`);
                    })
                }
            }
        }

        if (['help', 'ajuda', 'howtoplay', 'comojogar'].includes(args[0].toLowerCase())) {
            const helpPages = [
                {
                    name: 'objetive',
                    embedTitle: 'Objetivo do jogo',
                    description: 'O objetivo do jogo é descobrir quem são os lobisomens e eliminar os mesmos'
                },
                {
                    name: 'workers',
                    embedTitle: 'Funções',
                    description: 'O jogo possui várias funções, sendo elas **Médico**, **Bruxa**, **Caçador**, **Vidente**, **Aldeão** e **Lobisomem**'
                },
                {
                    name: 'Médico',
                    embedTitle: 'Médico - Função',
                    description: 'O médico possui apenas uma função, **curar**. Caso o lobisomem ou algum personagem que possa matar mate alguém e o médico cure essa pessoa, ela não morrerá.'
                },
                {
                    name: 'Bruxa',
                    embedTitle: 'Bruxa - Função',
                    description: 'A bruxa possui duas funções, **curar** e **envenenar**. A função de curar faz a mesma do médico, enquanto a de envenenar pode matar algúem.'
                },
                {
                    name: 'Caçador',
                    embedTitle: 'Caçador - Função',
                    description: 'O caçador possui uma função, **matar**. Seu objetivo é matar o lobisomem e caso o mesmo erre, ele morre.'
                },
                {
                    name: 'Vidente',
                    embedTitle: 'Vidente - Função',
                    description: 'O vidente possui uma função, **ver a função de um jogador**. Seu objetivo é descobrir quem é o lobisomem e informar o resto da vila.'
                },
                {
                    name: 'Aldeão',
                    embedTitle: 'Aldeão - Função',
                    description: "O aldeão é o único que não possui funções. Ele apenas tem direito de voto durante o dia."
                },
                {
                    name: 'Lobisomem',
                    embedTitle: 'Lobisomem - Função',
                    description: 'O lobisomem é o vilão do jogo. Seu objetivo é causar desconfiança, brincando com os sentimentos dos jogadores e conseguir matar todos antes de ser descoberto e morto.'
                },
                {
                    name: 'Distribuição de funções',
                    embedTitle: 'Como é realizada a distribuição de funções',
                    description: 'Para todos os trabalhos, exceto lobisomem, a cada 4 jogadores, existem 2 desta função. Já para os lobisomens, a cada 4 jogaodres, existem 1 lobisomem.\n\n Mas se tiver, por exemplo, 5 jogadores, a prioridade da vaga será para o lobisomem.'
                }
            ];

            let index = -1;

            const pages = helpPages.length;

            const sendHelp = (msg) => {
                index++;

                const embed = new this.client.embed()
                    .setAuthor(helpPages[index].embedTitle, this.client.user.displayAvatarURL())
                    .setDescription(helpPages[index].description);

                (msg ? msg.edit(embed) : message.channel.send(embed)).then(m => {

                    const emojis = ['⬅️', '➡️'];

                    emojis.map(e => m.react(e));

                    const collector = m.createReactionCollector((r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id);

                    collector.on('collect', async ({ emoji }) => {
                        switch (emoji.name) {
                            case '➡️':
                                if (index === pages - 1) return;

                                sendHelp(m);

                                return collector.stop();
                                break;

                            case '⬅️':
                                if (index === 0) return;

                                index -= 2;

                                sendHelp(m)

                                return collector.stop();
                                break;
                        }
                    })

                })

            }
            sendHelp()
        }

        if (['start', 'iniciar'].includes(args[0].toLowerCase())) {

            if (!game) return this.respond('Não há nenhum jogo em espera.');

            if (game.owner !== message.author.id) return this.respond('Apenas o criador da sala pode iniciar a partida.');

            if (game.running) return this.respond('A partida já foi iniciada.');

            if (game.users.length < 4) return this.respond('São necessários no mínimo 4 jogadores para iniciar uma partida.')

            game.running = true;
            game.actions = [];

            const embaralhar = (array) => {
                let atual = array.length;
                let temp;
                let random;

                while (atual !== 0) {
                    random = Math.floor(Math.random() * atual);

                    atual--;

                    temp = array[atual];
                    array[atual] = array[random];
                    array[random] = temp;
                }

                return array;
            };

            game.workers = await embaralhar(game.workers);

            game.workers.sort((a, b) => b.priority - a.priority).map(async (w, i) => {

                for (let i = 0; i < game.users.length && i < (Math.ceil(game.users.length / 4) * w.usersSize); i++) {
                    const validUsers = game.users.filter(u => !u.worker);

                    if (!validUsers) return;

                    const user = validUsers[Math.floor(Math.random() * validUsers.length)];

                    if (!user) return;

                    game.users.find(c => c.id === user.id).worker = w;

                    game.workers[game.workers.indexOf(w)].users.push(user.id);
                }
            });

            game.users.map(u => {
                message.guild.members.cache.get(u.id).send(new this.client.embed().setDescription(`<@${u.id}>, sua tarefa é: **${u.worker.name}**! Aguarde por mais instruções.`))
                    .catch(async err => {

                        game.users.splice(game.users.indexOf(u), 1);

                        const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === u.worker.name))]
                        game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(u.id), 1)
                        message.channel.send(new this.client.embed().setDescription(`${user} foi desclassificado por estar com as mensagens privadas desabilitadas.`));
                        return res(true);
                    });
            });

            await this.playNight(message, game);
        }
    }

    async playNight(message, game) {
        game.night++;
        game.actions = []

        if (!message.channel.permissionsFor(this.client.user.id).has('MANAGE_CHANNELS')) this.respond(`Detectei que não possuo permissão para gerenciar as permissões deste canal. Para uma melhor experiência, por favor, me dê essa permissão.`);

        if (message.channel.permissionsFor(this.client.user.id).has('MANAGE_CHANNELS')) message.channel.updateOverwrite(message.guild.roles.everyone, { SEND_MESSAGES: false, ADD_REACTIONS: false });


        const firstEmbed = new this.client.embed()
            .setDescription(`Todos os jogadores vão para suas casas e fecham os olhos para dormir.`)
            .setImage(`https://media.discordapp.net/attachments/677653633835204619/784115127522951238/4a8d7949e6147ab9a9d151c54d06d288.png?width=360&height=480`)
            .setFooter(`Noite ${game.night}`, this.client.user.displayAvatarURL());

        message.channel.send(firstEmbed);

        setTimeout(async () => {

            const embed = new this.client.embed()
                .setFooter('Caso não faça nada dentro de 60 segundos, será removido do jogo.');

            let msg;

            for (const u of game.users) {
                await new Promise(async res => {
                    const user = message.guild.members.cache.get(u.id);




                    embed.setDescription(`Está na vez de ${user}. Verifique seu privado! \`(60 segundos)\` `)
                    embed.setThumbnail(u.avatar);

                    msg = await (msg ? await msg.edit(embed) : await message.channel.send(embed));

                    const lobisomens = game.users.filter(u => u.worker.name === 'Lobisomem')

                    const userEmbed = new this.client.embed()
                        .setAuthor('Utilizar habilidade', this.client.user.displayAvatarURL())
                        .setDescription(u.worker.habilidades[0] ?
                            `${user}, escolha uma habilidade para utilizar! \n\n ${u.worker.habilidades.map(h => `${this.client.emojis.cache.get(h.emoji) || h.emoji} - ${h.name}`)}\n\n${u.worker.name === 'Lobisomem' ? lobisomens.length > 1 ? `Os outros lobisomens são: ${lobisomens.filter(lobi => lobi.id !== u.id).map(l => `<@${l.id}>`).join(", ")}` : '' : ''}`
                            :
                            `${user}, você como aldeão não possui habilidades, portanto, reaja com ✅ para continuar o jogo.`)
                        .setThumbnail(u.avatar);

                    const userMessage = await user.send(userEmbed).catch(err => {
                        game.users.splice(game.users.indexOf(u), 1);

                        const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === u.worker.name))]
                        game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(u.id), 1)
                        message.channel.send(new this.client.embed().setDescription(`${user} foi desclassificado por estar com as mensagens privadas desabilitadas.`));
                        return res(true);
                    });

                    [...u.worker.habilidades.map(c => c.emoji), '✅'].map(async e => await userMessage.react(e))

                    const collector = userMessage.createReactionCollector((r, userR) => [...u.worker.habilidades.map(c => c.emoji), '✅'].includes(r.emoji.id ? r.emoji.id : r.emoji.name) && userR.id === user.id, {
                        max: 1,
                        time: 60000,
                        limit: 1
                    });

                    collector.on('collect', async r => {

                        userMessage.delete({ timeout: 0 });

                        if (u.worker.name === 'Aldeão') {

                            user.send(`✅`)
                            return res(true);
                        }

                        if (r.emoji.name === '✅') {
                            user.send(`✅`)
                            return res(true);
                        }

                        const selectUserEmbed = new this.client.embed()
                            .setAuthor('Selecionar usuário', this.client.user.displayAvatarURL())
                            .setDescription(`Digite abaiaxo o número correspondente ao usuário.

                            ${game.users.filter(usuario => usuario.id !== u.id).map((usuario, i) => `${i + 1} - <@${usuario.id}>`).join('\n')}`)

                        const selectUserMessage = await user.send(selectUserEmbed).catch(err => {
                            game.users.splice(game.users.indexOf(u), 1);

                            const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === u.worker.name))]
                            game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(u.id), 1)
                            message.channel.send(new this.client.embed().setDescription(`${user} foi desclassificado por estar com as mensagens privadas desabilitadas.`));
                            return res(true);

                        });

                        const secondCollector = selectUserMessage.channel.createMessageCollector(m => m.author.id === u.id, { time: 60000 });

                        secondCollector.on('collect', async ({ content }) => {
                            const allowed = game.users.filter(usuario => usuario.id !== u.id).map((a, b) => b + 1);

                            if (isNaN(content)) return user.send('Você deve inserir um número válido!');

                            if (!allowed.includes(Number(content))) return user.send('Este número não é correspodente à nenhum usuário.');

                            const usuarioAfetado = game.users.filter(usuario => usuario.id !== u.id)[Number(content) - 1];

                            const selectedAction = u.worker.habilidades.find(h => h.emoji === (r.emoji.id ? r.emoji.id : r.emoji.name))

                            game.actions.push({
                                executor: u.id,
                                action: selectedAction.name,
                                vítima: usuarioAfetado.id
                            });

                            if (selectedAction.special) selectedAction.special(user, message, game, usuarioAfetado)

                            user.send(`✅`)

                            secondCollector.stop('limit');

                            await res(true)
                        })
                    });

                    collector.on('end', async (c, reason) => {

                        if (reason !== 'limit') {
                            game.users.splice(game.users.indexOf(u), 1);

                            const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === u.worker.name))]
                            game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(u.id), 1)
                            message.channel.send(new this.client.embed().setDescription(`${user} foi desclassificado por inatividade.`));
                            return res(true);
                        };

                    })
                })
            };

            msg.delete({ timeout: 0 })

            await this.playDay(message, game)

        }, 5000)
    }

    async playDay(message, game) {

        game.day++
        game.votes = [];

        const dayEmbed = new this.client.embed()
            .setAuthor('Está de dia!', this.client.user.displayAvatarURL())
            .setDescription(`<@${game.owner}>, reaja abaixo para continuar o jogo.`)
            .setFooter('Caso não reaja em 30 segundos, o jogo continuará automaticamente.', this.client.user.displayAvatarURL())

        const sendDayEmbed = await message.channel.send(dayEmbed);

        sendDayEmbed.react('✅')

        const collector = sendDayEmbed.createReactionCollector((r, u) => r.emoji.name === '✅' && u.id === game.owner, { max: 1, time: 30000 })

            .on('end', async (reaction, reason) => {

                const mortes = game.actions.filter(a => ['envenenar', 'matar'].includes(a.action)).filter(a => !game.actions.find(action => action.action === 'curar' && action.vítima === a.vítima))
                const logEmbed = new this.client.embed()
                    .setDescription(`${mortes.length ? `Houveram ${mortes.length} mortes! \n\n ${mortes.map((m, i) => {
                        const user = game.users.find(u => u.id === m.vítima);

                        if (!user) return `💀 Usuário já removido do jogo.`;

                        game.users.splice(game.users.indexOf(user), 1)

                        return `💀 <@${user.id}> - **${user.worker.name}**`
                    }).join("\n")}` : `Não houveram mortes hoje!`
                        } `)
                    .setFooter('Continuando jogo em 10 segundos...', this.client.user.displayAvatarURL())

                const sendLogEmbed = await sendDayEmbed.edit(logEmbed);

                setTimeout(async () => {
                    if (!game.users.find(u => u.worker.name === 'Lobisomem') || !game.users.find(u => u.worker.name !== 'Lobisomem')) return this.endGame(message, game);

                    const votationEmbed = new this.client.embed()
                        .setDescription(`Todos os jogadores se reúnem para discutir e tentar descobrir quem são os lobisomens!`)
                        .setImage('https://www.comprerural.com/wp-content/uploads/2019/09/propriedade-rural-640x355.jpg')
                        .setFooter('Tempo de discussão: 1m 30s. Para adiantar o tempo da discussão, reaja abaixo (dono da sala)', this.client.user.displayAvatarURL());

                    await sendLogEmbed.edit(votationEmbed);

                    if (message.channel.permissionsFor(this.client.user.id).has('MANAGE_CHANNELS')) message.channel.updateOverwrite(message.guild.roles.everyone, { SEND_MESSAGES: true, ADD_REACTIONS: true });

                    sendLogEmbed.createReactionCollector((r, u) => r.emoji.name === '✅' && u.id === game.owner, { max: 1, time: 90000 })

                        .on('end', async (c, reason) => {
                            if (message.channel.permissionsFor(this.client.user.id).has('MANAGE_CHANNELS')) message.channel.updateOverwrite(message.guild.roles.everyone, { SEND_MESSAGES: false, ADD_REACTIONS: false });
                            sendLogEmbed.delete({ timeout: 0 });

                            const votationEmbed = new this.client.embed()
                                .setAuthor('Votação!', this.client.user.displayAvatarURL());

                            let msg;

                            for (const u of game.users) {
                                await new Promise(async res => {

                                    const user = message.guild.members.cache.get(u.id);

                                    votationEmbed.setDescription(`Está na vez de ${user}.Verifique seu privado! \`(60 segundos)\` `)
                                    votationEmbed.setThumbnail(u.avatar);

                                    msg = await (msg ? await msg.edit(votationEmbed) : await message.channel.send(votationEmbed));

                                    const userEmbed = new this.client.embed()
                                        .setAuthor('Vote em alguém!', this.client.user.displayAvatarURL())
                                        .setDescription(`Insira o número correspondente ao jogador. \n\n${game.users.map((p, i) => `${i + 1} - <@${p.id}>`).join("\n")}`)
                                        .setFooter(`Caso não vote em 60 segundos, será desclassificado.`, this.client.user.displayAvatarURL());

                                    const voteUserMessage = await user.send(userEmbed).catch(err => {
                                        game.users.splice(game.users.indexOf(u), 1);

                                        const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === u.worker.name))]
                                        game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(u.id), 1)
                                        message.channel.send(new this.client.embed().setDescription(`${user} foi desclassificado por estar com as mensagens privadas desabilitadas.`));
                                        return res(true);
                                    })

                                    const secondCollector = voteUserMessage.channel.createMessageCollector(m => m.author.id === u.id, { time: 60000 });

                                    secondCollector.on('collect', async ({ content }) => {
                                        const allowed = game.users.map((a, b) => b + 1);

                                        if (isNaN(content)) return user.send('Você deve inserir um número válido!');

                                        if (!allowed.includes(Number(content))) return user.send('Este número não é correspodente à nenhum usuário.');

                                        const usuarioAfetado = game.users[Number(content) - 1];

                                        const exists = game.votes.find(v => v.id === usuarioAfetado.id);

                                        exists ? game.votes[game.votes.indexOf(exists)].votes += 1 : game.votes.push({ id: usuarioAfetado.id, votes: 1 });

                                        secondCollector.stop('limit');

                                        user.send('✅');

                                        return res(true);
                                    })

                                        .on('end', async (co, endReason) => {
                                            if (endReason !== 'limit') {
                                                game.users.splice(game.users.indexOf(u), 1);

                                                const userWorker = game.workers[game.workers.indexOf(game.workers.find(work => work.name === u.worker.name))]
                                                game.workers[game.workers.indexOf(userWorker)].users.splice(game.workers[game.workers.indexOf(userWorker)].users.indexOf(u.id), 1)
                                                message.channel.send(new this.client.embed().setDescription(`${user} foi desclassificado por inatividade.`));
                                                return res(true);
                                            }
                                        })
                                })
                            };

                            const sort = game.votes.sort((a, b) => b.votes - a.votes);

                            msg.delete({ timeout: 0 });

                            const resultEmbed = new this.client.embed()
                                .setAuthor('Resultado da votação', this.client.user.displayAvatarURL())
                                .setDescription(sort[1] && sort[0].votes === sort[1].votes ? `<@${sort[0].id}> e <@${sort[1].id}> empataram!\n\nNinguém foi eliminado.` : `<@${sort[0].id}> foi eliminado por ter \`${sort[0].votes}\` votos! **(${game.users.find(u => u.id === sort[0].id).worker.name})**`)
                                .setFooter('Continuando jogo em 10 segundos...', this.client.user.displayAvatarURL());

                            if (!sort[1] || sort[0].votes > sort[1].votes) game.users.splice(game.users.indexOf(game.users.find(u => u.id === sort[0].id)), 1);

                            message.channel.send(resultEmbed);

                            setTimeout(async () => {
                                if (!game.users.find(u => u.worker.name === 'Lobisomem') || !game.users.find(u => u.worker.name !== 'Lobisomem')) return this.endGame(message, game);

                                this.playNight(message, game);
                            }, 10000)

                        })
                }, 10000)
            })
    }

    async endGame(message, game) {
        message.channel.send(`Os ${game.users.find(u => u.worker.name === 'Lobisomem') ? `lobisomens` : 'aldeões'} venceram a partida! (${game.users.map(u => `<@${u.id}>`)})`);

        this.client.games.werewolf.delete(message.channel.id);

        if (message.channel.permissionsFor(this.client.user.id).has('MANAGE_CHANNELS')) message.channel.updateOverwrite(message.guild.roles.everyone, { SEND_MESSAGES: true, ADD_REACTIONS: true });
    }

    async updateChannel(game) {

    }
}

module.exports = Werewolf
