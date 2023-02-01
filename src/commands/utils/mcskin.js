const Base = require("../../services/Command");
const axios = require('axios')
const Discord = require('discord.js')

class McSkin extends Base {
  constructor(client) {
    super(client, {
      name: "mcskin",
      description: "descriptions:mcskin",
      usage: "usages:mcskin",
      category: "categories:utils",
      cooldown: 1000,
      aliases: ["mcs", "info-minecraftserver"]
    });
  }

  async run({ message, args, prefix }, t) {
    let player = args.join(" ")

    if(!player) {
      return message.respond(t('commands:mcskin.error'))
    }

    let url = `https://mc-heads.net/body/${player}.png`

    message.channel.send({files: [url]});
  }
}

module.exports = McSkin;