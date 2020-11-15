const Base = require("../../services/Command");


class Ppt extends Base {
  constructor(client) {
    super(client, {
      name: "ppt",
      description: "descriptions:ppt",
      category: "categories:fun",
      cooldown: 5000,
      aliases: ['pedra-papel-tesoura'],
    });
  }

  async run({ message, args, prefix }, t) {

    if (!args[0]) return this.respond(t('commands:ppt.noOption', { member: message.author.id, prefix: prefix }));

    if (!args[1]) return this.respond(t('commands:ppt.noMention', { member: message.author.id }));

    const user = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.cache.get(args[1]) || message.guild.members.cache.find(member => member.nickname === args[1]);

    if (!user) return this.respond(t('commands:ppt.noUserFound', { member: message.author.id }));

    if (user.user.bot) return this.respond(t('commands:ppt.isBot', { member: message.author.id }));
    if (user !== message.member) return this.respond(t('commands:ppt.isYou', { member: message.author.id }));

    message.channel.send(`${user}`, new this.client.embed(message.author)
      .setDescription(t('commands:ppt:sendChallenge.description', { user: user.user.id, member: message.author.id }))
      .setFooter(t('commands:ppt:sendChallenge.footer')))
      .then(async sendChallenge => {

        const waiting = await this.respond(t('commands:ppt.waitingAccept'));

        await sendChallenge.react("✅");
        await sendChallenge.react("❌");

        const ChallengeReaction = sendChallenge.createReactionCollector((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id === user.user.id, { max: 1, time: 60000 * 2 });


        ChallengeReaction.on('collect', async (r, u) => {
          switch (r.emoji.name) {

            case '❌':
              waiting.edit(new this.client.embed(message.author).setDescription(t('commands:ppt.challengeDeny')));
              break;

            case '✅':
              waiting.edit(new this.client.embed(message.author).setDescription(t('commands:ppt.challengeAccept')));

              this.respond(`${message.member}, verifique seu privado.`);

              const questionToMember = await message.member.send(new this.client.embed().setDescription(t('commands:ppt.reactToPlay')));
              const questionToUser = await user.send(new this.client.embed().setDescription(t('commands:ppt.reactToPlay')));

              const array = ['🗻', '📰', '✂️'];
              for (let i = 0; i < array.length; i++) {

                questionToMember.react(array[i]);
                questionToUser.react(array[i]);
              }

              let responseMember = 'nao';
              let responseUser = 'nao';
              const winMessage = [`E o ganhador é... ${message.author}!`, `E o ganhador é... ${user}!`, `Empatou!`]
              const memberCollector = questionToMember.createReactionCollector((r, u) => array.includes(r.emoji.name) && u.id === message.author.id, { max: 1, time: 30000 });
              const userCollector = questionToUser.createReactionCollector((r, u) => array.includes(r.emoji.name) && u.id === user.user.id, { max: 1, time: 30000 });


              memberCollector.on('collect', async (r1, u1) => {
                if (responseUser === 'nao') {

                  responseMember === r1.emoji.name;
                  questionToMember.delete();
                  message.member.send(new this.client.embed().setDescription(t('commands:ppt.waitingPlay')))
                  return;
                }

                responseMember = r1.emoji.name;

                const ganhador = await getResult(r1.emoji.name, responseUser);

                await message.member.send(new this.client.embed().setDescription(t('commands:ppt.winMessage', { message: winMessage[ganhador - 1], member: responseMember, user: responseUser })));
                await user.send(new this.client.embed().setDescription(t('commands:ppt.winMessage', { message: winMessage[ganhador - 1], member: responseMember, user: responseUser })));

              })

              userCollector.on('collect', async (r1, u1) => {
                if (responseMember === 'nao') {
                  responseUser = r1.emoji.name;
                  questionToUser.delete();
                  user.send(new this.client.embed().setDescription(t('commands:ppt.waitingPlay')));
                  return;
                }

                responseUser = r1.emoji.name;

                const ganhador = await getResult(responseMember, r1.emoji.name);

                await message.member.send(new this.client.embed().setDescription(t('commands:ppt.winMessage', { message: winMessage[ganhador - 1], member: responseMember, user: responseUser })));
                await user.send(new this.client.embed().setDescription(t('commands:ppt.winMessage', { message: winMessage[ganhador - 1], member: responseMember, user: responseUser })));


              })




              memberCollector.on('end', () => {

                if (memberCollector.endReason() !== 'limit') return user.send(new this.client.embed().setDescription(`A partida foi cancelada pois seu oponente não fez sua jogada.`));
              })

              userCollector.on('end', () => {

                if (userCollector.endReason() !== 'limit') return user.send(new this.client.embed().setDescription(`A partida foi cancelada pois seu oponente não fez sua jogada.`));
              })
              break;

          }
        })

        ChallengeReaction.on('end', () => {

          if (ChallengeReaction.endReason() !== 'limit') return this.respond(`<:errado:739176302317273089> ${message.member}, o usuário não deu nenhuma resposta.`)

        })

      }).catch(err => this.respond(`${message.member}, não é possível desafiar o usuário pois ele está com as mensagens privadas desabilitadas.`))


    function getResult(me, clientChosen) {
      if ((me === "🗻" && clientChosen === "✂") ||
        (me === "📰" && clientChosen === "🗻") ||
        (me === "✂" && clientChosen === "📰")) {

        return 1;

      } else if (me === clientChosen) {

        return 3;

      } else {

        return 2;

      }
    }

  }
}

module.exports = Ppt;