const Base = require("../../services/Command");

const ms = require('ms');

class Sorteio extends Base {
    constructor(client) {
        super(client, {
            name: "sorteio",
            description: "descriptions:sorteio",
            category: "categories:utils",
            permissions: ['MANAGE_GUILD'],
            usage: "usages:sorteio",
            cooldown: 1000,
            aliases: ["giveaway", 'gy']
        });
    }

    async run({ message, args, prefix }, t) {

        const filter = ({ author }) => author.id === message.author.id;
        const collector = await message.channel.createMessageCollector(filter, { time: 60000000 });

        const response = {};

        const questions = [
            {
                msg: t('commands:sorteio.item'),
                save: 'item'
            },
            {
                msg: t('commands:sorteio.winnerCount'),
                save: 'winnerCount'
            },
            {
                msg: t('commands:sorteio.time'),
                save: 'time'
            },
            {
                msg: t('commands:sorteio.channel'),
                save: 'channel'
            },
            {
                msg: t('commands:sorteio.emoji'),
                save: 'emoji'
            }
        ];

        let state = -1;

        const sendQuestion = (send = false) => {
            state++;

            if (questions[state]) {

                if (send === true) {
                    message.channel.send(new this.client.embed(message.author).setDescription(questions[state].msg).setFooter(t('commands:sorteio.cancel'), this.client.user.displayAvatarURL()))
                }

            } else {
                collector.stop();
                let timeNow = Date.now();
                timeNow += ms(response['time'])
                timeNow = new Date(timeNow)

                this.client.controllers.sorteios.start(message.guild.channels.cache.get(response['channel']), {
                    time: ms(response['time']),
                    prize: response['item'],
                    winnerCount: parseInt(response['winnerCount']),
                    embedColor: "#D90000",
                    embedColorEnd: "#D90000",
                    hostedBy: message.author,
                    botsCanWin: false,
                    exemptPermissions: false,
                    exemptMembers: false,
                    reaction: typeof response['emoji'] === 'object' ? response['emoji'].id : response['emoji'].toString(),
                    messages: {
                        giveaway: '',
                        giveawayEnded: '',
                        timeRemaining: t('commands:sorteio:giveaway.timeRemaining'),
                        inviteToParticipate: t('commands:sorteio:giveaway.inviteToParticipate', { emoji: response['emoji'].toString() } ),
                        winMessage: t('commands:sorteio:giveaway.winMessage'),
                        embedFooter: t('commands:sorteio:giveaway.embedFooter'),
                        noWinner: t('commands:sorteio:giveaway.noWinner'),
                        hostedBy: t('commands:sorteio:giveaway.hostedBy'),
                        winners: t('commands:sorteio:giveaway.winners'),
                        endedAt: t('commands:sorteio:giveaway.endedAt'),
                        units: {
                            seconds: t('commands:sorteio:giveaway:units.segundos'),
                            minutes: t('commands:sorteio:giveaway:units.minutos'),
                            hours: t('commands:sorteio:giveaway:units.horas'),
                            days: t('commands:sorteio:giveaway:units.dias'),
                            pluralS: false // Not needed, because units end with a S so it will automatically removed if the unit value is lower than 2
                        }
                    },
                    lastChance: {
                        enabled: true,
                        content: t('commands:sorteio:giveaway.lastChance'),
                        threshold: 60000,
                        embedColor: "#D90000",
                    }
                })
            }

        }

        sendQuestion(true);

        collector.on('collect', async (co) => {
            
            let { content } = co;
            
            if (content.toLowerCase() === 'cancelar') {
                collector.stop();
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.canceled', { member: message.author.id })));
                return;
            }


            if (content.length > 1024) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.1024', { member: message.author.id })).setColor("GREEN"))
                setTimeout(async () => {
                    await state--
                    sendQuestion(false)
                }, 3000)
                return;
            }


            if (questions[state].save === 'time' && ms(content) === undefined) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.noTimeFound')));
                state--
                await sendQuestion(false);
                return;
            }

            if (questions[state].save === 'channel') content = content.replace('<', '').replace('>', '').replace('#', '');

            const channel = message.guild.channels.cache.get(content);

            if (questions[state].save === 'channel' && !channel) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.noChannelFound', { member: message.author.id }))); state--
                await sendQuestion(false);
                return;
            }

            if (questions[state].save === 'channel' && !channel.permissionsFor(this.client.user).has('SEND_MESSAGES') || questions[state].save === 'channel' && !channel.permissionsFor(this.client.user).has('ADD_REACTIONS')) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.noPermissionsInChannel', { member: message.author.id })));
            }

            if (questions[state].save === 'winnerCount' && isNaN(content)) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.invalidNumber', { member: message.author.id })));
                state--
                await sendQuestion(false);
                return;
            }
            
            if(questions[state].save === 'emoji') {
                
                if(co.emojis.first()) {
                    const question = questions[state];
                    
                    response[question.save] = co.emojis.first();
                    
                    return sendQuestion(true);
                };
                
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.noEmojiFound', { member: message.author.id })));
                
                state--;
                
                await sendQuestion(false);
                
                return;
            }

            const question = questions[state];

            response[question.save] = content;

            sendQuestion(true);
        });

    }
}

module.exports = Sorteio;
