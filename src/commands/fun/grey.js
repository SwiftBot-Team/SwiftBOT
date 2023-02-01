const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Grey extends Base {
    constructor(client) {
        super(client, {
            name: "grey",
            description: "descriptions:grey",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["greyscale"],
            usage: "usages:grey",
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {
        const input = message.attachments.first()
        const user = message.mentions.users.first()

        if (input) {
            const image = await new Images().grey(input.url)
            
            const $image = new Discord.MessageAttachment(image, 'grey.png')

            return message.channel.send($image)
        }

        if (user) {
            const image = await new Images().grey(user.displayAvatarURL({
                format: 'png',
                dynamic: false,
                size: 2048
            }))

            const $image = new Discord.MessageAttachment(image, 'grey.png')

            return message.channel.send($image)
        }

        const image = await new Images().grey(message.author.displayAvatarURL({
            format: 'png',
            dynamic: false,
            size: 2048
        }))

        const $image = new Discord.MessageAttachment(image, 'grey.png')

        return message.channel.send($image)
    }
}

module.exports = Grey