const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Blur extends Base {
    constructor(client) {
        super(client, {
            name: "blur",
            description: "descriptions:blur",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["efeito"],
            usage: "usages:blur",
            permissions: [],
        });
    }

    async run({ message, args, prefix }, t) {
        const input = message.attachments.first()
        const user = message.mentions.users.first()

        if (input) {
            const image = await new Images().blur(input.url)
            
            const $image = new Discord.MessageAttachment(image, 'Blur.png')

            return message.channel.send($image)
        }

        if (user) {
            const image = await new Images().blur(user.displayAvatarURL({
                format: 'png',
                dynamic: false,
                size: 2048
            }))

            const $image = new Discord.MessageAttachment(image, 'Blur.png')

            return message.channel.send($image)
        }

        const image = await new Images().blur(message.author.displayAvatarURL({
            format: 'png',
            dynamic: false,
            size: 2048
        }))

        const $image = new Discord.MessageAttachment(image, 'Blur.png')

        return message.channel.send($image)
    }
}

module.exports = Blur
