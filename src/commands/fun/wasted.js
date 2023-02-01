const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Wasted extends Base {
    constructor(client) {
        super(client, {
            name: "wasted",
            description: "descriptions:wasted",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["morto", "gta"],
            usage: "usages:wasted",
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {
        const user = message.mentions.users.first()

        if (user) {
            const image = await new Images().wasted(user)

            const $image = new Discord.MessageAttachment(image, 'Wasted.png')

            return message.channel.send($image)
        }

        const image = await new Images().wasted(message.author)

        const $image = new Discord.MessageAttachment(image, 'Wasted.png')

        return message.channel.send($image)
    }
}

module.exports = Wasted