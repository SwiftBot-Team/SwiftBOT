const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Trash extends Base {
    constructor(client) {
        super(client, {
            name: "trash",
            description: "descriptions:trash",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["lixo"],
            usage: "usages:trash",
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {
        const user = message.mentions.users.first()

        if (user) {
            const image = await new Images().trash(user)

            const $image = new Discord.MessageAttachment(image, 'Trash.png')

            return message.channel.send($image)
        }

        const image = await new Images().trash(message.author)

        const $image = new Discord.MessageAttachment(image, 'Trash.png')

        return message.channel.send($image)
    }
}

module.exports = Trash