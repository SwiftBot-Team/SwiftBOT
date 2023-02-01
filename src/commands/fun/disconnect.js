const Base = require("../../services/Command")
const Images = require('../../services/Images')
const Discord = require('discord.js')
const axios = require('axios')

class Disconnect extends Base {
    constructor(client) {
        super(client, {
            name: "disconnect",
            description: "descriptions:disconnect",
            category: "categories:fun",
            usage: "usages:disconnect",
            cooldown: 1000,
            aliases: ["disconnect-mc"],
            permissions: [],
            bot_permissions: ['ATTACH_FILES'],
            hidden: true,
            maintenance: true
        });
    }

    async run({ message, args, prefix }, t) {
        const text = args.join(' ')

        if (!text) return message.respond(t('commands:disconnect.error'))

        const image = new Images().disconnected(text)

        message.channel.send({ files: [{ attachment: image, name: 'Disconnect.png' }] })
    }
}

module.exports = Disconnect
