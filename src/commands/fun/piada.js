const Base = require("../../services/Command");

const fetch = require('got');

class Piada extends Base {
  constructor(client) {
    super(client, {
      name: "piada",
      description: "descriptions:piada",
      category: "categories:fun",
      cooldown: 1000,
      aliases: ['joke'],
      slash: true
    });
  }

  async run({ message, args, prefix }, t) {
    
    const lang = await this.client.getLanguage(message.guild);
    const piadas = lang === 'pt' ? require('../../utils/piadas.js') : JSON.parse((await fetch('https://www.reddit.com/r/jokes/random/.json')).body)[0].data.children[0].data;
    
    message.respond(lang === 'pt' ? piadas[Math.floor(Math.random() * piadas.length)] : piadas.title + '\n\n' + piadas.selftext)
  }
}

module.exports = Piada;