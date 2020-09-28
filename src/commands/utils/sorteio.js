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

                message.guild.channels.cache.get(response['channel']).send(new this.client.embed(this.client.user)
                    .setAuthor(t('commands:sorteio.author'), this.client.user.displayAvatarURL())
                    .setFooter(t('commands:sorteio.endWhen'), this.client.user.displayAvatarURL())
                    .setTimestamp(timeNow)
                    .setDescription(t('commands:sorteio.giveaway', {
                        autor: message.author.id,
                        time: response['time'],
                        winnerCount: response['winnerCount'],
                        item: response['item']
                    }))).then(async msg => {

                        msg.react("🎉")


                         this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/sorteios/${msg.id}`).set(response);
                         this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/sorteios/${msg.id}`).update({ msg: msg.id, end: Number(ms(response['time']) + Date.now()) });


                        setTimeout(() => {
                            this.client.emit('giveawayEnd', {
                                guildID: message.guild.id,
                                channelID: message.channel.id,
                                messageID: msg.id,
                                winnerCount: response['winnerCount'],
                                item: response['item'],
                                autorID: message.author.id,
                                time: response['time']
                            })
                        }, ms(response['time']))

                    })
            }

        }

        sendQuestion(true);

        collector.on('collect', async ({ content }) => {
          
          if(content.toLowerCase() === 'cancelar') {
            collector.stop();
            message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.canceled', {member: message.author.id})));
            return;
          }
          
          
            if (content.length > 1024) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.1024', {member: message.author.id})).setColor("GREEN"))
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
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.noChannelFound', {member: message.author.id})));                state--
                await sendQuestion(false);
                return;
            }
          
          if (questions[state].save === 'channel' && !channel.permissionsFor(this.client.user).has('SEND_MESSAGES') || questions[state].save === 'channel' && !channel.permissionsFor(this.client.user).has('ADD_REACTIONS')) {
            message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.noPermissionsInChannel', {member: message.author.id})));
          }

            if (questions[state].save === 'winnerCount' && isNaN(content)) {
                message.channel.send(new this.client.embed().setDescription(t('commands:sorteio.invalidNumber', {member: message.author.id})));
                state--
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