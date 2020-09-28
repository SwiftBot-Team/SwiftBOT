const Base = require("../../services/Command");
const Discord = require('discord.js')

const PerfilImage = require('../../services/Images')

class UserInfo extends Base {
  constructor(client) {
    super(client, {
      name: "userinfo",
      description: "descriptions:userinfo",
      usage: "usages:userinfo",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["ui", "user", "perfil"]
    });
  }

  async run({ message, args, prefix }, t) {
    const perfil = await new PerfilImage(message.author).loadPerfil()

    message.channel.send(new Discord.MessageAttachment(perfil))
  }
}

module.exports = UserInfo;