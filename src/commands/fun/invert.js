const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Invert extends Base {
    constructor(client) {
        super(client, {
            name: "invert",
            description: "descriptions:invert",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["invert-image", "invert-colors"],
            usage: "usages:invert",
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {
        const input = message.attachments.first()
        const user = message.mentions.users.first()

        if (input) {
            const image = await new Images().invert(input.url)
            
            const $image = new Discord.MessageAttachment(image, 'invert.png')

            return message.channel.send($image)
        }

        if (user) {
            const image = await new Images().invert(user.displayAvatarURL({
                format: 'png',
                dynamic: false,
                size: 2048
            }))

            const $image = new Discord.MessageAttachment(image, 'invert.png')

            return message.channel.send($image)
        }

        const image = await new Images().invert(message.author.displayAvatarURL({
            format: 'png',
            dynamic: false,
            size: 2048
        }))

        const $image = new Discord.MessageAttachment(image, 'invert.png')

        return message.channel.send($image)
    }
}

module.exports = Invert