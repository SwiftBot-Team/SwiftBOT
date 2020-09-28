const Base = require("../../services/Command");
const Collection = require('../../services/Collection')

class Emojis extends Base {
  constructor(client) {
    super(client, {
      name: "emojis",
      description: "descriptions:emojis",
      category: "categories:info",
      cooldown: 1000,
      aliases: ['list-emojis', 'ver-emojis']
    })
  }
 
  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)

    const emojis = new Collection();

    let actualPage = 1;

    message.guild.emojis.cache.map(e => {
      emojis.push(e.id ? e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>` : e.name)  // tem animated tbm '-'(tem a na frente)
    });
    
    const pages = Math.ceil(emojis.length() / 30);

    Embed
      .setAuthor(t('commands:emojis.title'), 'https://cdn.discordapp.com/emojis/751390656777289798.png?v=1')

    let paginatedEmojis = emojis.paginate(actualPage, 30)

    Embed.setDescription(paginatedEmojis.join(' '))

    message.channel.send(Embed).then(msg => {
      if(pages <= 1) return; 
      
      msg.react("⏩");
      
      const collector = msg.createReactionCollector((r, u) =>  ['⏪', '⏩'].includes(r.emoji.name) && u.id === message.author.id);
      
      collector.on('collect', async (r, u) => {
        switch(r.emoji.name) {
          case '⏩':
            if (message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(message.author.id);
            
            if(actualPage === pages) return;
            
            actualPage++;
            paginatedEmojis = emojis.paginate(actualPage, 30);
            
            Embed.setDescription(paginatedEmojis.join(' '));
            await msg.edit(Embed);
            await msg.react("⏪")
            if (actualPage === pages && message.guild.me.permissions.has('MANAGE_MESSAGES')) r.remove('⏩');
            if (actualPage === pages && !message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(this.client.user.id);
            
            break;
            
          case '⏪':
            if (message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(message.author.id);
            
            if(actualPage === 1) return;
            
            actualPage--;
            
            paginatedEmojis = emojis.paginate(actualPage, 30);
            
            Embed.setDescription(paginatedEmojis.join(' '));
            await msg.edit(Embed);
            if (actualPage === 1 && message.guild.me.permissions.has('MANAGE_MESSAGES')) r.remove('⏪');
            if (actualPage === 1 && !message.guild.me.permissions.has('MANAGE_MESSAGES')) r.users.remove(this.client.user.id);
            msg.react('⏩')
        }
      })
      
      
    })
    
  }
}
module.exports = Emojis