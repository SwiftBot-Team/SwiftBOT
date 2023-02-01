const Command = require('../../services/Command')

class Vaporonda extends Command {
    constructor(client) {
        super(client, {
            name: 'vaporonda',
            aliases: ['vaportext'],
            description: "descriptions:vaporonda",
            category: "categories:fun",
        })
    }


    async run({ message, args, prefix }, t) {

        if (!args[0]) return message.respond(t('commands:vaporonda.noArgs'));

        const vaporwavefield = args.join(" ").split(" / ")[0].split('').map(char => {
            const code = char.charCodeAt(0);

            return code >= 33 && code <= 126 ? String.fromCharCode((code - 33) + 65281) : char;
        }).join("");

        message.respond(vaporwavefield);

    }
}

module.exports = Vaporonda;