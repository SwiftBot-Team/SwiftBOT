const Base = require("../../services/Command");
const Discord = require('discord.js')

class youtubenotification extends Base {
  constructor(client) {
    super(client, {
      name: "youtubenotification",
      description: "descriptions:youtubenotification",
      category: "categories:utils",
      cooldown: 1000,
      aliases: ['suporte']
    })
  }

  async run({ message, args, prefix }, t) {


  }
}
module.exports = youtubenotification