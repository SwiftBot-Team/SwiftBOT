const Base = require("../../services/Command");

const ms = require('ms');

class Ressortear extends Base {
    constructor(client) {
        super(client, {
            name: "ressortear", 
            description: "descriptions:ressortear",
            category: "categories:utils",
            usage: "usages:ressortear",
            cooldown: 1000,
            aliases: ["gerrol"]
        });
    }

    async run({ message, args, prefix }, t) {
      
      let db;
      
        if (!args[0]) {
            const dbLast = await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/sorteios/lastGiveaway`).once('value');

            if (!dbLast.val()) return message.channel.send(new this.client.embed().setDescription(`${message.member}, não consegui encontrar nenhum sorteio antigo. Tente inserir o ID da mensagem do sorteio para que eu possa encontrar.`));

            db = await await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/sorteios/${dbLast.val()}`).once('value');

            const channel = message.guild.channels.cache.get(db.val().channel);

            const msg = await channel.messages.fetch(db.val().msg);

            if (!msg) return message.channel.send(new this.client.embed()
                .setAuthor(t('commands:sorteio.giveawayError'), this.client.user.displayAvatarURL())
                .setFooter(t('commands:sorteio.giveawayError'), this.client.user.displayAvatarURL())
                .setDescription(t('commands:sorteio.messageNoFound')));

            const reactions = msg.reactions.cache.get("🎉").users.cache.array().filter(user => !user.bot);


            if (reactions.length < db.val().winnerCount) return channel.send(new this.client.embed(this.client.user).setDescription(t('commands:sorteio.noReactions')));

            let messageWinner = "";


            for (let i = 0; i < db.val().winnerCount; i++) {
                let random = Math.floor(Math.random() * reactions.length)
                let user = reactions[random]
                messageWinner += `<@${user.id}> \n`
            }
          
            msg.channel.send(new this.client.embed(this.client.user).setDescription(`${db.val().winnerCount > 1 ? t('commands:ressortear.plural') + messageWinner : t('commands:ressotear.singular') + messageWinner}`));

        } else {
          
          db = await await this.client.database.ref(`SwiftBOT/Servidores/${message.guild.id}/sorteios/${args[0]}`).once('value');
          
          if(!db.val()) return message.channel.send(new this.client.embed().setDescription(t('commands:ressortear.noGiveawayFound', {member: message.author.id})));
          
          const msg = await this.client.channels.cache.get(db.val().channel).messages.fetch(db.val().msg);
          
          if (!msg) return message.channel.send(new this.client.embed()
                .setAuthor(t('commands:sorteio.giveawayError'), this.client.user.displayAvatarURL())
                .setFooter(t('commands:sorteio.giveawayError'), this.client.user.displayAvatarURL())
                .setDescription(t('commands:sorteio.messageNoFound')));
          
          const reactions = msg.reactions.cache.get("🎉").users.cache.array().filter(user => !user.bot);


            if (reactions.length < db.val().winnerCount) return this.client.channels.cache.get(db.val().channel).send(new this.client.embed(this.client.user).setDescription(t('commands:sorteio.noReactions')));

            let messageWinner = "";


            for (let i = 0; i < db.val().winnerCount; i++) {
                let random = Math.floor(Math.random() * reactions.length)
                let user = reactions[random]
                messageWinner += `<@${user.id}> \n`
            }
          
            msg.channel.send(new this.client.embed(this.client.user).setDescription(`${db.val().winnerCount > 1 ? t('commands:ressortear.plural') + messageWinner : t('commands:ressotear.singular') + messageWinner}`));
        }
    }
}

module.exports = Ressortear;