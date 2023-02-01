const Command = require('../../services/Command');
const Images = require('../../services/Images');
const Discord = require('discord.js');
const axios = require('axios');

class Ejected extends Command {
  constructor(client) {
    super(client, {
      name: 'ejected',
      aliases: ['eject'],
      description: 'descriptions:ejected',
      usage: 'usages:ejected',
      category: 'categories:fun',
    });
  }

  async run({ message, args, prefix }, t) {
    const name = args[0];

    if (!name) return message.respond(t('commands:ejected.error'));
    if (name.length > 10)
      return message.respond(t('commands:ejected.maxchars'));

    const msg = await message.channel.send(
      `<:Duvida:807665311373459457> \`${name}\` ${t(
        'commands:ejected.isImpostor'
      )}`
    );

    const collector = msg.channel.createMessageCollector(
      (m) => m.author.id === message.author.id,
      { max: 1, time: 15000 }
    );

    collector.on('collect', async (m) => {
      const answers = {
        positives: ['sim', 'yes', 's', 'y'],
        negatives: ['não', 'no', 'n'],
      };

      const allAnswers = [...answers.positives, ...answers.negatives];

      if (!allAnswers.includes(m.content.toLowerCase()))
        return message.respond(t('commands:ejected.invalidAnswer'));

      const impostor = answers.positives.includes(m.content.toLowerCase());

      await message.channel.send(
        `<:Duvida:807665311373459457> \`${name}\` ${t(
          'commands:ejected.color'
        )}`
      );

      const collector1 = msg.channel.createMessageCollector(
        (m) => m.author.id === message.author.id,
        { max: 1, time: 15000 }
      );

      collector1.on('collect', (m1) => {
        const answers = [
          'black',
          'blue',
          'brown',
          'cyan',
          'darkgreen',
          'lime',
          'orange',
          'pink',
          'purple',
          'red',
          'white',
          'yellow',
        ];

        if (!answers.includes(m1.content.toLowerCase())) {
          return message.respond(t('commands:ejected.invalidColor'));
        }

        const img = new Images().ejected(
          name,
          impostor,
          m1.content.toLowerCase()
        );

        axios
          .get(img, {
            responseType: 'arraybuffer',
          })
          .then(({ data }) => {
            const buffer = Buffer.from(data, 'base64');

            const image = new Discord.MessageAttachment(
              buffer,
              'Ejected.png'
            );

            return message.channel.send(image);
          });

        collector1.on('end', async (_, endReason) => {
          if(endReason !== 'limit') {
            return message.respond(t('commands:ejected.end'));
          }
        });
      });
    });

    collector.on('end', async (_, endReason) => {
      if(endReason !== 'limit') {
        return message.respond(t('commands:ejected.end'));
      }
    });
  }
}

module.exports = Ejected;
