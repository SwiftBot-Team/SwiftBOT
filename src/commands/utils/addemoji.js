const Base = require("../../services/Command");

class addEmoji extends Base {
  constructor(client) {
    super(client, {
      name: "addemoji",
      description: "descriptions:addemoji",
      category: "categories:utils",
      usage: "usages:addemoji",
      cooldown: 3000,
      aliases: ["adicionaremoji"],
      permissions: ['MANAGE_EMOJIS'],
      bot_permissions: ['MANAGE_EMOJIS']
    });
  }

  async run({ message, args, prefix }, t) {
    	const emoji = message.attachments.first()?.url || message.emojis.first()?.url || args[0];
      
    	if(!emoji || !emoji.startsWith('https')) return message.respond(`Você precinsa inserir o emoji que deseja adicionar! \`[arquivo|emoji|url]\` `);
      
    	const name = args[1];
      
    	if(!name) return message.respond(`Você precisa inserir o nome do emoji!`);
      
    	const maxEmojis = {
        	0: 50,
        	1: 100,
        	2: 150,
        	3: 250
    	};
      
      	if(message.guild.emojis.cache.size > maxEmojis[message.guild.premiumTier]) return message.respond(`Este emojis não possui mais slots disponíveis para emojis.`);
      
      	message.guild.emojis.create(emoji, name).then(e => {
            message.respond(`${e} emoji adicionado com sucesso!`)
        }, (err) => {
            console.log(err)
            message.respond(`Ocorreu um erro ao adicionar o emoji.`)
        })
      
      
  }
}

module.exports = addEmoji;