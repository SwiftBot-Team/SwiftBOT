const Command = require('../../services/Command');
const Images = require('../../services/Images');
const Discord = require('discord.js');
const axios = require('axios');

class EmergencyMeeting extends Command {
  constructor(client) {
    super(client, {
      name: 'emergencymeeting',
      aliases: ['emergencymeet'],
      description: 'descriptions:emergencymeeting',
      usage: 'usages:emergencymeeting',
      category: 'categories:fun',
    });
  }

  async run({ message, args, prefix }, t) {
    const text = args.join(' ');

    if (!text) return message.respond(t('commands:emergencymeeting.error'))

    const img = new Images().emergencymeeting(text);

    axios
      .get(img, {
        responseType: 'arraybuffer',
      })
      .then(({ data }) => {
        const buffer = Buffer.from(data, 'base64');

        const image = new Discord.MessageAttachment(buffer, 'EmergencyMeeting.png');

        return message.channel.send(image);
      });
  }
}

module.exports = EmergencyMeeting;
