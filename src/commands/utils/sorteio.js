const Base = require("../../services/Command");

const ms = require('ms');

class Sorteio extends Base {
    constructor(client) {
        super(client, {
            name: "sorteio",
            description: "descriptions:sorteio",
            category: "categories:utils",
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
                    message.channel.send(new this.client.embed(message.author).setDescription(questions[state].msg))
                }

            } else {
                collector.stop();
                message.guild.channels.cache.get(response['channel']).send(new this.client.embed(this.client.user).setDescription(t('commands:sorteio.giveaway', {
                    autor: message.author.id,
                    time: response['time'],
                    winnerCount: response['winnerCount'],
                    item: response['item']
                }))).then(async msg => {
                  
                    msg.react("🎉")


                    this.client.database.ref(`Swift/sorteios/${message.guild.id}/${msg.id}`).set(response);
                    this.client.database.ref(`Swift/sorteios/${message.guild.id}/${msg.id}`).update({ msg: msg.id, end: Number(ms(response['time']) + Date.now()) })

                    setTimeout(async () => {
                      this.client.instance.emit('giveawayEnd', {message})
                        this.client.database.ref(`Swift/sorteios/${message.guild.id}/${response['item']}/status`).set('inativo');
                        this.client.database.ref(`Swift/sorteios/${message.guild.id}/lastGiveaway`).set(msg.id);

                        const reactions = msg.reactions.cache.get("🎉").users.cache.array()

                        const winners = [];

                        let possibleWinners = [];

                        //if (!reactions.length-1 >= response['winnerCount']) return message.channel.send('cancelado pq n tem user')
                        let possible = reactions.filter(user => !user.id === this.client.user.id);
                        
                        possible.map(p => {
                          if(winners.includes(p)) return;
                            possibleWinners.push(p)
                        });
                      let random = Math.floor(Math.random() * possibleWinners.length)
                      let i = 0;
                      
                      
                      while(i < response['winnerCount']) {
                        
                        if(!winners.includes(possibleWinners[random])) {
                          i++;
                          winners.push(possibleWinners[random]);
                          random = Math.floor(Math.random() * possibleWinners.length)
                        }
                        
                      }

                        

                        msg.edit(new this.client.embed().setDescription(t('commands:sorteio.end', {
                            autor: message.author.id,
                            time: response['time'],
                            winnerCount: response['winnerCount'],
                            item: response['item'],
                            winners: winners.join(', ')
                        })))
                    }, ms(response['time']))

                })
            }

        }

        sendQuestion(true);

        collector.on('collect', async ({ content }) => {
            if (content.length > 1024) {
                message.channel.send(new this.client.embed().setDescription(`${message.author}, a sua resposta foi grande demais e não consegui enviar para o banco de dados. Por favor, insira uma resposta mais curta.`).setColor("GREEN"))
                setTimeout(async () => {
                    await state--
                    sendQuestion(false)
                }, 3000)
                return;
            }


            if (questions[state].save === 'time' && ms(content) === undefined) {
                message.channel.send(new this.client.embed().setDescription(`${message.author}, não consegui entender o tempo inserido. Por favor, insira um tempo válido.`));
                state--
                await sendQuestion(false);
                return;
            }

            if (questions[state].save === 'channel') content = content.replace('<', '').replace('>', '').replace('#', '');
            
            const channel = message.guild.channels.cache.get(content);
          
            if (questions[state].save === 'channel' && !channel) {
              message.channel.send(new this.client.embed().setDescription(`${message.member}, eu não consegui encontrar o canal. Tente enviar um canal válido.`))
                state--
                await sendQuestion(false);
                return;
            }

            if (questions[state].save === 'winnerCount' && isNaN(content)) {
                message.channel.send(new this.client.embed().setDescription(`${message.member}, a quantidade de ganhadores deve ser um número. Responda novamente com um **número**.`))
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