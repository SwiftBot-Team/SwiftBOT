const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')
const axios = require('axios')

class Burn extends Base {
    constructor(client) {
        super(client, {
            name: "burn",
            description: "descriptions:burn",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["queima"],
            usage: "usages:burn",
            permissions: [],
            bot_permissions: ['ATTACH_FILES'],
            hidden: true,
            maintenance: true
        });
    }

    async run({ message, args, prefix }, t) {
        const user = message.mentions.members.first()

        if (!user) {
            const image = new Images().burn(message.author)

            return message.channel.send({ files: [{ attachment: image, name: 'Burn.png' }] })
        }
        const image = new Images().burn(user.user)

        message.channel.send({ files: [{ attachment: image, name: 'Burn.png' }] })
    }
}

module.exports = Burn
