const Command = require('../../services/Command')

class Procurargift extends Command {
  constructor(client) {
    super(client, {
      name: 'procurar-gif',
      aliases: ['search-gif', 'procurargif', 'searchgif'],
      description: "descriptions:procurar-gif",
      category: "categories:fun",
      nsfw: true
    })
  }
  
  
  async run({message, args, prefix}, t) {
    
    if(!args[0]) return message.respond(t('commands:procurar-gift.noArgs'));
    
    require("gif-search").random(args.join(" "))
    .then(gift => {
      message.respond(`[Clique aqui](${gift})`, true, {image: gift})
    }).catch(err => message.respond(`Não encontrei resultados para este gift.`))
  }
}

module.exports = Procurargift;