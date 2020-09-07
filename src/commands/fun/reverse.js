const Command = require('../../services/Command')

class Reverse extends Command {
  constructor(client) {
    super(client, {
      name: 'reverse',
      aliases: ['reverter-texto'],
      description: "descriptions:reverse",
      category: "categories:fun"
    })
  }
  
  
  async run({message, args, prefix}, t) {
    
    if(!args[0]) return this.respond(t('commands:reverse.noArgs'));
    
    message.channel.send(args.join(' ').split('').reverse().join(''))
    
  }
}

module.exports = Reverse;
