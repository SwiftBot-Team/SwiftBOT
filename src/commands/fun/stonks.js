const Command = require('../../services/Command');
const Images = require('../../services/Images');
const Discord = require('discord.js');
const axios = require('axios');

class Stonks extends Command {
  constructor(client) {
    super(client, {
      name: 'stonks',
      aliases: ['stonk'],
      description: 'descriptions:stonks',
      usage: 'usages:stonks',
      category: 'categories:fun',
    });
  }

  async run({ message, args, prefix }, t) {
    let user = this.getUsers()[0];
    const isNotStonks = user ? args[1] === '-' : args[0] === '-';

    if (!user) user = message.author;
    else user = user.user;

    const img = new Images().stonks(user.displayAvatarURL(), isNotStonks);

    axios
      .get(img, {
        responseType: 'arraybuffer',
      })
      .then(({ data }) => {
        const buffer = Buffer.from(data, 'base64');

        const image = new Discord.MessageAttachment(buffer, 'Stonks.png');

        return message.channel.send(image);
      });
  }
}

module.exports = Stonks;
