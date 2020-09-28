const Base = require("../../services/Command");

class Emojify extends Base {
    constructor(client) {
        super(client, {
            name: "emojify",
            description: "descriptions:emojify",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ['emoji-letter', 'texto-para-emoji']
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return message.channel.send(new this.client.embed().setDescription(t('commands:emojify.no_args', { user: message.author.id })));

        const specialCodes = {
            '0': ':zero:',
            '1': ':one:',
            '2': ':two:',
            '3': ':three:',
            '4': ':four:',
            '5': ':five:',
            '6': ':six:',
            '7': ':seven:',
            '8': ':eight:',
            '9': ':nine:',
            '#': ':hash:',
            '*': ':asterisk:',
            '?': ':grey_question:',
            '!': ':grey_exclamation:',
            ' ': '   '
        }

        const text = args.join(" ").split(' / ')[0].toLowerCase().split('');

        const fiedEmoji = text.map(letter => {
            if (/[a-z]/g.test(letter)) {

                return `:regional_indicator_${letter}: `

            } else if (specialCodes[letter]) {

                return `${specialCodes[letter]} `

            }
        }).join('')
        message.channel.send(fiedEmoji).catch(err => {
          message.channel.send(new this.client.embed().setDescription(t('commands:emojify.error', {user: message.author.id})))
        })

    }
}
module.exports = Emojify;