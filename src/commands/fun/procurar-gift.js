const Command = require('../../services/Command')

class Procurargift extends Command {
  constructor(client) {
    super(client, {
      name: 'procurar-gift',
      aliases: ['search-gift', 'procurargift', 'searchgift'],
      description: "descriptions:procurar-gift",
      category: "categories:fun",
      nsfw: true
    })
  }
  
  
  async run({message, args, prefix}, t) {
    
    if(!args[0]) return this.respond(t('commands:procurar-gift.noArgs'));
    
    require("gif-search").random(args.join(" "))
    .then(gift => {
      this.respond(`[Clique aqui](${gift})`, true, {image: gift})
    }).catch(err => this.respond(`Não encontrei resultados para este gift.`))
  }
}

module.exports = Procurargift;
