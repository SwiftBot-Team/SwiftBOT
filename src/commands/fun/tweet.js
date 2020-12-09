const Command = require('../../services/Command')
const Discord = require('discord.js')

const axios = require('axios');

class Tweet extends Command {
    constructor(client) {
        super(client, {
            name: 'tweet',
            aliases: ['tweetar', 'faketweet'],
            description: "descriptions:tweet",
            category: "categories:fun",
        })
    }


    async run({ message, args, prefix }, t) {
        if (!args[0]) return this.respond(t('commands:tweet.noArgs1', { member: message.author.id }));

        if (!args[1]) return this.respond(t('commands:tweet.noArgs2', { member: message.author.id }));

        const user = args[0].toString().split('#', 1);

        const text = args.slice(1).join(" ");

        axios.get(`https://nekobot.xyz/api/imagegen?type=tweet&username=${user}&text=${encodeURIComponent(text)}`)
            .then(({ data }) => {
                message.channel.send(new Discord.MessageAttachment(data.message, 'file.png'))
            })
    }
}

module.exports = Tweet;