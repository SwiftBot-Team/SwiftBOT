const Base = require("../../services/Command");

class Nuke extends Base {
  constructor(client) {
    super(client, {
      name: "nuke",
      description: "descriptions:nuke",
      category: "categories:utils",
      cooldown: 10000,
      aliases: ['clone', 'clonar-canal', 'clone-channel'],
      bot_permissions: ['MANAGE_CHANNELS'],
      permissions: ['MANAGE_CHANNELS']
    });
  }

  async run({ message, args, prefix }, t) {
    
    const channel = message.mentions.channels.first() || message.channel;
    
    if(!channel.permissionsFor(this.client.user).has('MANAGE_CHANNEL')) return message.respond('Eu preciso da permissão de GERENCIAR CANAL no canal para poder realizar esta operação.');
    
    const send = await message.respond('Você tem certeza que deseja recriar o canal?');
    
    await send.react('❌');
    await send.react('✅');
    
    send.createReactionCollector((r, u) => ['❌', '✅'].includes(r.emoji.name) && u.id === message.author.id, { max: 1, time: 30000 })
    
    .on('collect', async ({ emoji }) => {
      if(emoji.name === '❌') return message.respond('Operação cancelada com sucesso.');
      
      const position = channel.position;
      
      const newChannel = await channel.clone();
      
      await channel.delete();
      
      await newChannel.setPosition(position);
      
      return newChannel.send('Canal clonado com sucesso.')
    })
    
    .on('end', async (_, reason) => {
      if(reason !== 'limit') return message.respond('Você demorou demais para responder.');
    })
  }
}

module.exports = Nuke;
