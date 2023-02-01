const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')

class Triggered extends Base {
    constructor(client) {
        super(client, {
            name: "triggered",
            description: "descriptions:triggered",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["triggered-gif"],
            usage: "usages:triggered",
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {
        const user = message.mentions.members.first()

        if (!user) {
            const image = await new Images().triggered(message.author)
            
            const $image = new Discord.MessageAttachment(image, 'Triggered.gif')

            return message.channel.send($image)
        }
        const image = await new Images().triggered(user.user)

        const $image = new Discord.MessageAttachment(image, 'Triggered.gif')

        message.channel.send($image)
    }
}

module.exports = Triggered