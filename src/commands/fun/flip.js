const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')
const axios = require('axios')

class Flip extends Base {
    constructor(client) {
        super(client, {
            name: "flip",
            description: "descriptions:flip",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["flip-gif"],
            usage: "usages:flip",
            permissions: [],
            bot_permissions: ['ATTACH_FILES'],
            hidden: true,
            maintenance: true
        });
    }

    async run({ message, args, prefix }, t) {
        const user = message.mentions.members.first()

        if (!user) {
            const image = new Images().flip(message.author)

            return message.channel.send({ files: [{ attachment: image, name: 'Flip.gif' }] })
        }
        const image = new Images().flip(user.user)

        message.channel.send({ files: [{ attachment: image, name: 'Flip.gif' }] })
    }
}

module.exports = Flip
