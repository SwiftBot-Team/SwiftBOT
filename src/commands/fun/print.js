const Command = require('../../services/Command')

class Print extends Command {
  constructor(client) {
    super(client, {
      name: 'print',
      aliases: ['screenshot'],
      description: "descriptions:print",
      category: "categories:fun",
      nsfw: true
    })
  }
  
  
  async run({message, args}) {
    const caracteres = "abcdefghijklmnopqrstuvxwyz0123456789";
    
    let result = "";
    
    for(let i = 0; i < 6; i++) result += caracteres.split("")[Math.floor(Math.random() * caracteres.split("").length)];
    
    await message.channel.send("https://prnt.sc/" + result)
  }
}

module.exports = Print;
