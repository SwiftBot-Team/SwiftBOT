const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Pixelate extends Base {
    constructor(client) {
        super(client, {
            name: "pixelate",
            description: "descriptions:pixelate",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["pixelate-image"],
            usage: "usages:pixelate",
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {
        const input = message.attachments.first()
        const user = message.mentions.users.first()

        if (input) {
            const image = await new Images().pixelate(input.url)
            
            const $image = new Discord.MessageAttachment(image, 'Pixelate.png')

            return message.channel.send($image)
        }

        if (user) {
            const image = await new Images().pixelate(user.displayAvatarURL({
                format: 'png',
                dynamic: false,
                size: 2048
            }))

            const $image = new Discord.MessageAttachment(image, 'Pixelate.png')

            return message.channel.send($image)
        }

        const image = await new Images().pixelate(message.author.displayAvatarURL({
            format: 'png',
            dynamic: false,
            size: 2048
        }))

        const $image = new Discord.MessageAttachment(image, 'Pixelate.png')

        return message.channel.send($image)
    }
}

module.exports = Pixelate