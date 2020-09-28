const Command = require('../../services/Command')

class Printbomb extends Command {
  constructor(client) {
    super(client, {
      name: 'printbomb',
      aliases: ['print-bomb'],
      description: "descriptions:printbomb",
      category: "categories:fun",
      nsfw: true
    })
  }
  
  
  async run({message, args}) {
    const caracteres = "abcdefghijklmnopqrstuvxwyz0123456789";
    
    let result = "";
    
    for(let y = 0; y < 3; y++) {
      
      for(let i = 0; i < 6; i++) {
        result += caracteres.split("")[Math.floor(Math.random() * caracteres.split("").length)];
      }
      
      await message.channel.send("https://prnt.sc/" + result);
      result = "";
    }
  }
}

module.exports = Printbomb;