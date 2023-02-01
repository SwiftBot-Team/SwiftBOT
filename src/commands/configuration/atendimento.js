const Base = require("../../services/Command");

class Atendimento extends Base {
    constructor(client) {
        super(client, {
            name: "atendimento",
            cooldown: 1000,
            aliases: ["ticket"],
            permissions: ["MANAGE_GUILD", 'MANAGE_CHANNELS', 'MANAGE_WEBHOOKS'],
            usage: 'usages:atendimento',
            category: "categories:config",
            description: "descriptions:atendimento",
            bot_permissions: ['MANAGE_GUILD', 'MANAGE_CHANNELS', 'MANAGE_WEBHOOKS']
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return message.respond(t('commands:atendimento.noArgs', { member: message.author.id, prefix }));

        if (['help', 'ajuda', 'comandos', 'subcomandos', 'h', 'a'].includes(args[0].toLowerCase())) {
            const embed = new this.client.embed()
                .setAuthor(t('commands:atendimento:help.title', this.client.user.displayAvatarURL()))
                .setDescription(`
                ${t('commands:atendimento:help.1', { prefix })}
                ${t('commands:atendimento:help.2', { prefix })}
                ${t('commands:atendimento:help.3', { prefix })}
                ${t('commands:atendimento:help.4', { prefix })}
                ${t('commands:atendimento:help.5', { prefix })}
                ${t('commands:atendimento:help.6', { prefix })}
                ${t('commands:atendimento:help.7', { prefix })}
                `);

            await message.channel.send(embed)
        }
        if (['iniciar', 'on', 'enable', 'turn-on', 'ligar'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento:enable.noCofig', { member: message.author.id, prefix }))

            if (ref.val().enabled) return message.respond(t('commands:atendimento:enable.isEnabled', { member: message.author.id }));

            if (!ref.val().categories || !Object.values(ref.val().categories).length) return message.respond(t('commands:atendimento:enable.noCategories', { member: message.author.id, prefix }));

            this.client.controllers.atendimentos.get(message.guild.id).enabled = true;

            this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/enabled`).set(true);

            return message.respond(t('commands:atendimento:enable.sucess'))
        };

        if (['disable', 'desativar', 'desligar', 'turn-off', 'off'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento:disable.noCofig', { member: message.author.id, prefix }))

            if (!ref.val().enabled) return message.respond(t('commands:atendimento:disable.isDisabled', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/enabled`).set(false);

            return message.respond(t('commands:atendimento:disable.sucess'))
        }

        if (['config', 'configurar'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (ref.val()) return message.respond(t('commands:atendimento:config.isConfig', { member: message.author.id, prefix }))

            const filter = ({ author }) => author.id === message.author.id;

            const collector = await message.channel.createMessageCollector(filter, { time: 60000000 });

            const response = {};

            const questions = [
                {
                    msg: t('commands:atendimento:config.channelID'),
                    save: 'channelID'
                },
                {
                    msg: t('commands:atendimento:config.categoryToCreate'),
                    save: 'category'
                },
                {
                    msg: t('commands:atendimento:config.allowUserClose'),
                    save: 'allowUserClose'
                }
            ];

            let state = -1;

            const sendQuestion = (send = false) => {
                state++;

                if (questions[state]) {

                    if (send === true) {
                        message.respond((questions[state].msg), {
                            footer: t('commands:atendimento:config.cancel')
                        })
                    }

                } else {
                    collector.stop();
                    message.respond(t('commands:atendimento:config.sucess', { prefix }))

                    this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`)
                        .set({
                            category: response.category,
                            channel: response.channelID,
                            allowUserClose: response.allowUserClose === '1' ? false : true,
                            enabled: false
                        });

                    this.client.controllers.atendimentos.set(message.guild.id, {
                        id: message.guild.id,
                        category: response.category,
                        channel: response.channelID,
                        allowUserClose: response.allowUserClose === '1' ? false : true,
                        abertos: [],
                        categories: [],
                        enabled: false
                    })
                }

            }

            collector.on('collect', async content => {

                if (content.content.toLowerCase() === 'cancelar') {
                    collector.stop();
                    message.respond(t('commands:atendimento:config.canceled', { member: message.author.id }));
                    return;
                };

                if (content.content.length > 1024) {
                    message.respond(t('commands:atendimento:config.1024', { member: message.author.id }));

                    state--
                    sendQuestion(false)

                    return;
                };

                const thisQuestion = questions[state];

                if (thisQuestion.save === 'channelID') {
                    const channel = content.mentions.channels.first() || message.guild.channels.cache.get(content.content) || message.guild.channels.cache.find(c => c.name === content.content);

                    if (!channel || ['dm', 'voice', 'category'].includes(channel.type)) {
                        message.respond(t('commands:atendimento:config.invalidChannel', { member: message.author.id }));

                        state--;

                        return sendQuestion(false)

                    } else content = channel.id;
                }

                if (thisQuestion.save === 'category') {
                    const category = message.guild.channels.cache.get(content.content) || message.guild.channels.cache.find(c => c.name === content.content);

                    if (!category || ['dm', 'voice', 'text'].includes(category.type)) {
                        message.respond(t('commands:atendimento:config.invalidChannel', { member: message.author.id }));

                        state--;

                        return sendQuestion(false)

                    } else content = category.id;

                }

                if (thisQuestion.save === 'roles') {
                    const roles = await this.getRoles(content.content);

                    if (!roles.length) {
                        message.respond(t('commands:atendimento:config.noRoles', { member: message.author.id }));

                        state--;

                        return sendQuestion(false);

                    } else content = roles.map(r => r.id);

                }

                if (thisQuestion.save === 'allowUserClose') {
                    if (!['0', '1'].includes(content.content)) {
                        message.respond(t('commands:atendimento:config.invalidOption', { member: message.author.id }));

                        state--;

                        return sendQuestion(false);
                    } else content = content.content
                }

                response[thisQuestion.save] = content;
                sendQuestion(true)
            });

            sendQuestion(true)

        }

        if (['addcategory', 'adicionarcategoria', 'add'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento.noConfig', { member: message.author.id, prefix }))

            const questionName = await message.respond(t('commands:atendimento:addcategory.questionName', {
                member: message.author.id
            }), false, {
                footer: t('commands:atendimento:addcategory.cancel')
            });

            const categoryName = questionName.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

                .on('collect', async ({ content }) => {

                    if (['cancel', 'cancelar'].includes(content.toLowerCase())) {
                        message.respond(t('commands:atendimento:addcategory.canceled', { member: message.author.id }));

                        return categoryName.stop('user');
                    }

                    if (/[^a-z]/gi.test(content)) {

                        message.respond(t('commands:atendimento:addcategory.invalidName', {
                            member: message.author.id
                        }), false, {
                            footer: t('commands:atendimento:addcategory.cancel')
                        });

                        return false;
                    }

                    if (ref.val().categories && Object.values(ref.val().categories).find(cat => cat.name === content)) {

                        message.respond(t('commands:atendimento:addcategory.exists', { member: message.author.id, prefix }), false, {
                            footer: t('commands:atendimento:addcategory.cancel')
                        });

                        return false;
                    }

                    if (ref.val().categories && Object.values(ref.val().categories).length === 5) {
                        message.respond(t('commands:atendimento:addcategory.maxCategories', { member: message.author.id, prefix }), false, {
                            footer: t('commands:atendimento:addcategory.cancel')
                        });

                        return false;
                    }

                    categoryName.stop();

                    message.respond(t('commands:atendimento:addcategory.rolesToAdd', {
                        member: message.author.id
                    }), false, {
                        footer: t('commands:atendimento:addcategory.cancel')
                    });

                    const rolesToAdd = questionName.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

                        .on('collect', async (collected) => {

                            if (['cancel', 'cancelar'].includes(collected.content.toLowerCase())) {
       rolesToAdd.stop();                        return message.respond(t('commands:atendimento:addcategory.canceled', { member: message.author.id }));
}
                            const roles = await this.getRoles(collected.content).map(role => role.id);


                            if (!roles.length) {
                                message.respond(t('commands:atendimento:addcategory.noRoles', { member: message.author.id }), false, {
                                    footer: t('commands:atendimento:addcategory.cancel')
                                });

                                return false;
                            }

                            rolesToAdd.stop();

                            message.respond(t('commands:atendimento:addcategory.categoryEmoji', { member: message.author.id }), false, {
                                footer: t('commands:atendimento:addcategory.cancel')
                            });

                            const questionEmoji = questionName.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

                                .on('collect', async collectedEmoji => {

                                    if (['cancel', 'cancelar'].includes(collectedEmoji.content.toLowerCase())) {
           questionEmoji.stop();                            return message.respond(t('commands:atendimento:addcategory.canceled', { member: message.author.id }));
}
                                    const emojis = await this.getEmojis(collectedEmoji.content);

                                    if (!emojis.length || !emojis[0].length) {
                                        message.respond(t('commands:atendimento:addcategory.noEmojis', { member: message.author.id }), false, {
                                            footer: t('commands:atendimento:addcategory.cancel')
                                        });

                                        return false;
                                    }

                                    questionEmoji.stop();


                                    message.respond(t('commands:atendimento:addcategory.added', { member: message.author.id, prefix }));


                                    this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/categories/${content}`).set({
                                        name: content,
                                        roles: roles,
                                        emoji: emojis[0]
                                    });

                                    this.client.controllers.atendimentos.get(message.guild.id).categories.push({ emoji: emojis[0], name: content, roles: roles })

                                })

                                .on('end', async (collectedEmoji, reasonEmoji) => {
                                    if (reasonEmoji === 'user') return;

                                    message.respond(t('commands:atendimento.timeExpired', { member: message.author.id }));
                                })


                        })

                        .on('end', async (c, reason) => {
                            if (reason === 'user') return;

                            message.respond(t('commands:atendimento.timeExpired', { member: message.author.id }));
                        })
                })

                .on('end', async (collected, reason) => {
                    if (reason === 'user') return;

                    message.respond(t('commands:atendimento.timeExpired', { member: message.author.id }))
                })
        }

        if (['removecategory', 'removercategoria', 'remove'].includes(args[0].toLowerCase())) {

            if (!args[1]) return message.respond(t('commands:atendimento:removecategory.noArgs', { member: message.author.id }));

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/categories/${args.slice(1).join(" ")}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento:removecategory.noFound', { member: message.author.id, prefix }));

            this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/categories/${args.slice(1).join(" ")}`).remove();

            const controle = this.client.controllers.atendimentos.get(message.guild.id);

            controle.categories.splice(controle.categories.find(c => c.name === args[1]) - 1, 1);

            message.respond(t('commands:atendimento:removecategory.sucess', { member: message.author.id }));
        }

        if (['configmensagem', 'configurarmensagem', 'configmessage', 'configmsg'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento.noConfig', { member: message.author.id, prefix }));

            const response = {};


            const questions = [
                {
                    name: 'Por favor, insira o título do embed.',
                    save: 'titulo',
                    img: 'https://media.discordapp.net/attachments/747853978120749177/781531567042199572/unknown.png?width=643&height=377'
                },
                {
                    name: 'Agora insira o conteúdo do embed.',
                    save: 'conteudo',
                    img: 'https://media.discordapp.net/attachments/747853978120749177/781531775284412446/unknown.png?width=607&height=376'
                },
                {
                    name: 'Agora insira o que ficará no Footer do embed.',
                    save: 'footer',
                    img: 'https://media.discordapp.net/attachments/747853978120749177/781531933074260008/unknown.png?width=705&height=382'
                },
                {
                    name: 'Agora, caso haja alguma imagem para ser anexada, insira ela (Caso não haja, insira qualquer coisa).',
                    save: 'imagem',
                    img: 'https://media.discordapp.net/attachments/747853978120749177/781532112988930058/unknown.png?width=742&height=381'
                }
            ];

            const collector = this.message.channel.createMessageCollector(m => m.author.id === this.message.author.id);

            let state = -1


            const sendQuestion = async (send = false) => {
                state++;

                if (questions[state]) {

                    if (send === true) {
                        this.message.channel.send(new this.client.embed(this.message.author)
                            .setDescription(questions[state].name)
                            .setImage(questions[state].img ? questions[state].img : 'https://google.com/')
                            .setFooter(`Escreva 'cancelar' a qualquer momento para cancelar a operação.`, this.client.user.displayAvatarURL()))
                    }

                } else {
                    collector.stop();

                    const embed = new this.client.embed()
                        .setAuthor(response['titulo'], message.guild.iconURL())
                        .setDescription(response['conteudo'])
                        .setFooter(response['footer'], message.guild.iconURL());
                    if (response['imagem'].startsWith('http')) embed.setImage(response['imagem'])

                    const channel = this.client.channels.cache.get(ref.val().channel);

                    if (!channel) return message.respond(t('commands:atendimento:setmessage.noChannelExists', { member: message.author.id, prefix }));

                    channel.fetchWebhooks().then(async webhooks => {
                        let webhook = await channel.createWebhook(message.guild.name, { avatar: message.guild.iconURL() });

                        await webhook
                            .send(embed).then(msg => {

                                webhook.delete();

                                if (ref.val().messageID) channel.messages.fetch(ref.val().messageID).then(msg => msg.delete({ timeout: 1000 }), (err) => err);

                                this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/messageID`).set(msg.id);

                                this.client.controllers.atendimentos.get(message.guild.id).messageID = msg.id;

                                Object.values(ref.val().categories)
                                    .map(e => msg.react(e.emoji)
                                        .catch(err => {
                                            msg.delete({ timeout: 1000 }).then(err => err);

                                            return message.respond(t('commands:atendimento:setmessage.erroAddReaction', { emoji: e.emoji }))
                                        }))
                            }, (err) => message.respond(t('commands:atendimento:setmessage.erroSendMessage', { member: message.author.id })));

                    })
                }
            }

            sendQuestion(true);



            collector.on('collect', async content => {
                if (content.content.length >= 2048) {
                    message.respond(t('commands:atendimento:setmessage.maxChar'));
                    state--
                    return sendQuestion(false);
                }

                if (content.content.toLowerCase() === 'cancelar') {
                    collector.stop();
                    return this.reply(t('commands:atendimento:setmessage.canceled'))

                }
                const question = questions[state];

                if (['titulo', 'footer', 'conteudo'].includes(question.save)) content = content.content;

                if (question.save === 'imagem') content = content.attachments.first() ? content.attachments.first().url : content.content;
                response[question.save] = content;
                sendQuestion(true)

            })
        }

        if (['stats', 'status', 'info'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento.noConfig', { member: message.author.id, prefix }));

            const embed = new this.client.embed()
                .setAuthor(t('commands:atendimento:status.author'), this.client.user.displayAvatarURL())

                .addField(t('commands:atendimento:status:field1.name'),
                    `${t('commands:atendimento:status:field1.channel', { channel: ref.val().channel })}
                    ${t('commands:atendimento:status:field1.category', { categoryId: ref.val().category, categoryName: message.guild.channels.cache.get(ref.val().category) ? message.guild.channels.cache.get(ref.val().category).name : 'Categoria não encontrada' })}`)

                .addField(t('commands:atendimento:status:field2.name'),
                    `${ref.val().categories ? Object.values(ref.val().categories).map(c => `**${c.name} - Emoji: ${this.client.emojis.cache.get(c.emoji) || c.emoji}**`).join('\n') : 'Nenhuma'}`);

            await message.channel.send(embed);
        }

        if (['setchannel', 'setarcanal', 'changechannel', 'mudarcanal'].includes(args[0].toLowerCase())) {
            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return message.respond(t('commands:atendimento.noConfig', { member: message.author.id, prefix }));

            if (!args[1]) return message.respond(t('commands:atendimento:setchannel.noArgs1', { member: message.author.id }));

            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

            if (!channel) return message.respond(t('commands:atendimento:setchannel.noChannelFound', { member: message.author.id }));

            this.client.controllers.atendimentos.get(message.guild.id).channel = channel.id;

            this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/channel`).set(channel.id);

            message.respond(t('commands:atendimento:setchannel.sucess', { member: message.author.id }));
        }


    }
}

module.exports = Atendimento;