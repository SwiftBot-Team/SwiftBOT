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
      if(!args[0]) {
        const dbLast = await this.client.database.ref(`Swift/sorteios/${message.guild.id}/lastGiveaway`).once('value');
        
        if(!dbLast.val()) return message.channel.send(new this.client.embed().setDescription(`${message.member}, não consegui encontrar nenhum sorteio antigo. Tente inserir o ID da mensagem do sorteio para que eu possa encontrar.`));
        
        const db = await this.client.database.ref(`Swift/sorteios/${message.guild.id}/${dbLast.val()}`).once('value');
        message.guild.channels.cache.get(db.val().channel).messages.fetch(db.val().msg).then(async msg => {
          
          const reactions = msg.reactions.cache.get("🎉").users.cache.array()
          
                    let random = Math.floor(Math.random() * reactions.length);
                    
                    const winners = [];
                    
                    for(let i = 0; i < db.val().winnerCount && i < reactions.length; i++) {
                      winners.push(reactions[i])
                      random = Math.floor(Math.random() * reactions.length);
                    }
          msg.channel.send(`${db.val().winnerCount > 1 ? "Os novos ganhadores são" : "O novo ganhador é:"} ${winners}`)
          
        }).catch(err => {
          console.log(err);
        })
      }
    }
}

  module.exports = Ressortear;