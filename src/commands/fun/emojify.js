const Base = require("../../services/Command");

class Emojify extends Base {
    constructor(client) {
        super(client, {
            name: "emojify",
            description: "descriptions:emojify",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ['emoji-letter', 'texto-para-emoji'],
            options: []
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) return message.reply(new this.client.embed().setDescription(t('commands:emojify.no_args', { user: message.author.id })));

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
            ' ': '   ',
            'ç': 'c',
            'á': 'a',
            'é': 'e',
            'í': 'i',
            'ó': 'o',
            'ú': 'u',
            'â': 'a',
            'ê': 'e',
            'î': 'i',
            'ô': 'o',
            'û': 'u',
            'ã': 'a',
            'õ': 'o',
        }

        const text = args.join(" ").split(' / ')[0].toLowerCase().split('');

        const fiedEmoji = text.map(letter => {
            if (/[a-z]/g.test(letter)) {

                return `:regional_indicator_${letter}: `

            } else if (specialCodes[letter]) {

                return `${/[a-z]/g.test(specialCodes[letter]) ? `:regional_indicator_${specialCodes[letter]}:` : specialCodes[letter]}`

            }
        }).join('')
        message.reply(fiedEmoji).catch(err => {
          message.reply(new this.client.embed().setDescription(t('commands:emojify.error', {user: message.author.id})))
        })

    }
}
module.exports = Emojify;