const Base = require("../../services/Command");
const Discord = require('discord.js')

const PerfilImage = require('../../services/Images')

class Account extends Base {
  constructor(client) {
    super(client, {
      name: "account",
      description: "descriptions:account",
      usage: "usages:account",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["acc", "profile", "perfil"]
    });
  }

  async run({ message, args, prefix }, t) {
    const user = (this.getUsers()[0] ? this.getUsers()[0].user : null) || message.author

    const perfil = await new PerfilImage().loadPerfil(user, this.client, t)

    message.channel.send(new Discord.MessageAttachment(perfil))
  }
}

module.exports = Account;