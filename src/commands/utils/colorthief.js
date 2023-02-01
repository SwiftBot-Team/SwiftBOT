const Base = require("../../services/Command");
const isURL = require("is-url");
const ColorThief = require("../../services/ColorThief");
const Discord = require('discord.js')

class ColorThiefCommand extends Base {
  constructor(client) {
    super(client, {
      name: "colorthief",
      description: "descriptions:colorthief",
      category: "categories:utils",
      usages: "usages:colorthief",
      cooldown: 3000,
      aliases: ["color-thief", "thief"],
    });
  }

  async run({ message, args, prefix }, t) {
    const website = args.join(` `);
    const input = message.attachments.first();

    if (input) {
      const image = await ColorThief.getColors(input.url);
        
        console.log(image)

      const $image = new Discord.MessageAttachment(image, "ColorThief.png");

      return message.channel.send(t('commands:colorthief.title'), $image);
    }

    if (website && isURL(website)) {
      const image = await ColorThief.getColors(website);

      const $image = new Discord.MessageAttachment(image, "ColorThief.png");

      return message.channel.send(t('commands:colorthief.title'), $image);
    }

    return message.respond(t('commands:colorthief.error', { prefix }))
  }
}
module.exports = ColorThiefCommand;
