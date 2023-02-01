const Base = require("../../services/Command");

class Avatar extends Base {
  constructor(client) {
    super(client, {
      name: "avatar",
      description: "descriptions:avatar",
      category: "categories:info",
      usage: "usages:avatar",
      cooldown: 1000,
      aliases: ["a", "av"]
    });
  }

  run({ message, args, prefix }, t) {
    let number = 2
    let user = message.mentions.members.first() ? message.mentions.members.first() : message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.nickname === args[0]);

    if (!user) {
      user = message.author
      number = 1
    }

    user = this.client.users.cache.get(user.id)
    const embed = new this.client.embed(message.author)
      .setDescription(t(`commands:avatar.title-${number}`, { user: user.id }))
      .setImage(user.displayAvatarURL({ size: 2048, dynamic: true }))

    message.channel.send(embed)
  }
}

module.exports = Avatar;