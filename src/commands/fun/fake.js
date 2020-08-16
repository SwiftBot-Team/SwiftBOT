const Base = require("../../services/Command");

class Fake extends Base {
    constructor(client) {
        super(client, {
            name: "fake",
            description: "descriptions.fake",
            category: "categories.fun",
            cooldown: 1000,
            aliases: ['criar-fake', 'hook-fake']
        });
    }

    async run({ message, args, prefix }, t) {
      let user = message.mentions.members.first() ? message.mentions.members.first() : message.member;
      if(!args[0].startsWith("<@")) user = message.member;
      
      message.channel.fetchWebhooks().then(async webhooks => {
        let webhook = webhooks.find(w => w.name === 'Webhook');
        if(!webhook) webhook = await message.channel.createWebhook(user.user.username, user.user.displayAvatarURL());
        await webhook
          .send(user === message.member ? args.join(" ") : args.slice(1).join(" "), {"username": user === message.member ? message.author.username : user.user.username, "avatarURL": user === message.member ? message.author.displayAvatarURL(): user.user.displayAvatarURL()})
      })
    }}

module.exports = Fake;