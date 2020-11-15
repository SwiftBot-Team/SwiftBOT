const Base = require("../../services/Command");

class Atendimento extends Base {
    constructor(client) {
        super(client, {
            name: "atendimento",
            cooldown: 1000,
            aliases: ["ticket"],
            permissions: ["MANAGE_GUILD", 'MANAGE_CHANNELS'],
            usage: 'usages:atendimento',
            category: "categories:config",
            description: "descriptions:atendimento",
            devsOnly: true
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return this.respond(t('commands:atendimento.noArgs', { member: message.author.id, prefix }));

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
                ${t('commands:atendimento:help.8', { prefix })}
                ${t('commands:atendimento:help.9', { prefix })}
                `);

            await message.channel.send(embed)
        }
        if (['iniciar', 'start', 'on', 'enable', 'turn-on'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return this.respond(t('commands:atendimento:enable.noCofig', { member: message.author.id, prefix }))

            if (ref.val().enabled) return this.respond(t('commands:atendimento:enable.isEnabled', { member: message.author.id }));

            if (!ref.val().categories.length) return this.respond(t('commands:atendimento:enable.noCategories', { member: message.author.id, prefix }))

            this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/enabled`).set(true);

            return this.respond(t('commands:atendimento:enable.sucess'))
        };

        if (['disable', 'desativar', 'desligar', 'turn-off', 'off'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return this.respond(t('commands:atendimento:disable.noCofig', { member: message.author.id, prefix }))

            if (!ref.val().enabled) return this.respond(t('commands:atendimento:disable.isDisabled', { member: message.author.id }));

            this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/enabled`).set(false);

            return this.respond(t('commands:atendimento:disable.sucess'))
        }

        if (['config', 'configurar'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (ref.val()) return this.respond(t('commands:atendimento:config.isConfig', { member: message.author.id }))

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
                        this.respond((questions[state].msg), {
                            footer: t('commands:atendimento:config.cancel')
                        })
                    }

                } else {
                    collector.stop();
                    this.respond('coletor finalizado super voadora :)')

                    this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`)
                        .set({
                            category: response.category,
                            channel: response.channelID,
                            allowUserClose: response.allowUserClose === '1' ? false : true
                        })
                }

            }

            collector.on('collect', async content => {

                if (content.content.toLowerCase() === 'cancelar') {
                    collector.stop();
                    this.respond(t('commands:atendimento:config.canceled', { member: message.author.id }));
                    return;
                };

                if (content.content.length > 1024) {
                    this.respond(t('commands:atendimento:config.1024', { member: message.author.id }));

                    state--
                    sendQuestion(false)

                    return;
                };

                const thisQuestion = questions[state];

                if (thisQuestion.save === 'channelID') {
                    const channel = content.mentions.channels.first() || message.guild.channels.cache.get(content.content) || message.guild.channels.cache.find(c => c.name === content.content);

                    if (!channel || ['dm', 'voice', 'category'].includes(channel.type)) {
                        this.respond(t('commands:atendimento:config.invalidChannel', { member: message.author.id }));

                        state--;

                        return sendQuestion(false)

                    } else content = channel.id;
                }

                if (thisQuestion.save === 'category') {
                    const category = message.guild.channels.cache.get(content.content) || message.guild.channels.cache.find(c => c.name === content.content);

                    if (!category || ['dm', 'voice', 'text'].includes(category.type)) {
                        this.respond(t('commands:atendimento:config.invalidChannel', { member: message.author.id }));

                        state--;

                        return sendQuestion(false)

                    } else content = category.id;

                }

                if (thisQuestion.save === 'roles') {
                    const roles = await this.getRoles(content.content);

                    if (!roles.length) {
                        this.respond(t('commands:atendimento:config.noRoles', { member: message.author.id }));

                        state--;

                        return sendQuestion(false);

                    } else content = roles.map(r => r.id);

                }

                if (thisQuestion.save === 'allowUserClose') {
                    if (!['0', '1'].includes(content.content)) {
                        this.respond(t('commands:atendimento:config.invalidOption', { member: message.author.id }));

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

            if (!ref.val()) return this.respond(t('commands:atendimento.noConfig', { member: message.author.id, prefix }))

            const questionName = await this.respond(t('commands:atendimento:addcategory.questionName', {
                member: message.author.id
            }), false, {
                footer: t('commands:atendimento:addcategory.cancel')
            });

            const categoryName = questionName.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

                .on('collect', async ({ content }) => {
                    if (/[^a-z|0-9]/gi.test(content)) {

                        this.respond(t('commands:atendimento:addcategory.invalidName', {
                            member: message.author.id
                        }), false, {
                            footer: t('commands:atendimento:addcategory.cancel')
                        });

                        return false;
                    }

                    if (ref.val().categories && Object.values(ref.val().categories).find(cat => cat.name === content)) {

                        this.respond(t('commands:atendimento:addcategory.exists', { member: message.author.id, prefix }), false, {
                            footer: t('commands:atendimento:addcategory.cancel')
                        });

                        return false;
                    }

                    if (ref.val().categories && Object.values(ref.val().categories).length === 5) {
                        this.respond(t('commands:atendimento:addcategory.maxCategories', { member: message.author.id, prefix }), false, {
                            footer: t('commands:atendimento:addcategory.cancel')
                        });

                        return false;
                    }

                    categoryName.stop();

                    this.respond(t('commands:atendimento:addcategory.rolesToAdd', {
                        member: message.author.id
                    }), false, {
                        footer: t('commands:atendimento:addcategory.cancel')
                    });

                    const rolesToAdd = questionName.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

                        .on('collect', async (collected) => {

                            const roles = await this.getRoles(collected.content).map(role => role.id);


                            if (!roles.length) {
                                this.respond(t('commands:atendimento:addcategory.noRoles', { member: message.author.id }), false, {
                                    footer: t('commands:atendimento:addcategory.cancel')
                                });

                                return false;
                            }

                            rolesToAdd.stop();

                            this.respond(t('commands:atendimento:addcategory.categoryEmoji', { member: message.author.id }), false, {
                                footer: t('commands:atendimento:addcategory.cancel')
                            });

                            const questionEmoji = questionName.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 120000 })

                                .on('collect', async collectedEmoji => {

                                    const emojis = await this.getEmojis(collectedEmoji.content);

                                    if (!emojis.length || !emojis[0].length) {
                                        this.respond(t('commands:atendimento:addcategory.noEmojis', { member: message.author.id }), false, {
                                            footer: t('commands:atendimento:addcategory.cancel')
                                        });

                                        return false;
                                    }

                                    questionEmoji.stop();


                                    this.respond(t('commands:atendimento:addcategory.added', { member: message.author.id, prefix }));


                                    this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}/categories/${content}`).set({
                                        name: content,
                                        roles: roles,
                                        emoji: emojis[0]
                                    });

                                })

                                .on('end', async (collectedEmoji, reasonEmoji) => {
                                    if (reasonEmoji === 'user') return;

                                    this.respond(t('commands:atendimento.timeExpired', { member: message.author.id }));
                                })


                        })

                        .on('end', async (c, reason) => {
                            if (reason === 'user') return;

                            this.respond(t('commands:atendimento.timeExpired', { member: message.author.id }));
                        })
                })

                .on('end', async (collected, reason) => {
                    if (reason === 'user') return;

                    this.respond(t('commands:atendimento.timeExpired', { member: message.author.id }))
                })
        }

        if (['stats', 'status', 'info'].includes(args[0].toLowerCase())) {

            const ref = await this.client.database.ref(`SwiftBOT/config/atendimentos/${message.guild.id}`).once('value');

            if (!ref.val()) return this.respond(t('commands:atendimento.noConfig', { member: message.author.id, prefix }));

            const embed = new this.client.embed()
                .setAuthor(t('commands:atendimento:status.author'), this.client.user.displayAvatarURL())

                .addField(t('commands:atendimento:status:field1.name'),
                    `${t('commands:atendimento:status:field1.channel', { channel: ref.val().channel })}
                    ${t('commands:atendimento:status:field1.category', { categoryId: ref.val().category, categoryName: message.guild.channels.cache.get(ref.val().category) ? message.guild.channels.cache.get(ref.val().category).name : 'Categoria não encontrada' })}`)

                .addField(t('commands:atendimento:status:field2.name'),
                    `${ref.val().categories ? Object.values(ref.val().categories).map(c => `**${c.name} - Emoji: ${this.client.emojis.cache.get(c.emoji) || c.emoji}**`).join('\n') : 'Nenhuma'}`);

            await message.channel.send(embed);
        }


    }
}

module.exports = Atendimento;