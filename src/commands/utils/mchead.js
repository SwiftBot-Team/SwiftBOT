const Base = require("../../services/Command");
const axios = require('axios')
const Discord = require('discord.js')

class McHead extends Base {
  constructor(client) {
    super(client, {
      name: "mchead",
      description: "descriptions:mchead",
      usage: "usages:mchead",
      category: "categories:utils",
      cooldown: 1000,
      aliases: ["mcc", "mccabeca"]
    });
  }

  async run({ message, args, prefix }, t) {
    let player = args.join(" ")

    if(!player) {
      return message.respond(t('commands:mchead.error'))
    }

    let url = `https://mc-heads.net/head/${player}.png`

    message.channel.send({files: [url]});
  }
}

module.exports = McHead;