const Base = require("../../services/Command");

const axios = require('axios')

class Ascii extends Base {
    constructor(client) {
        super(client, {
            name: "ascii",
            description: "descriptions:ascii",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["ascii-art"],
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args.join(' ')) return message.channel.send(new this.client.embed().setDescription(t('commands:ascii.args_error', { member: message.member })));

        axios.get(`http://artii.herokuapp.com/make?text=${args.join(' ')}&font=doom`)
            .then((res) => {
                message.channel.send(res.data, {
                    code: 'md'
                });
            })
            .catch((err) => {
                if (err) return message.channel.send(new this.client.embed().setDescription(t('commands:ascii.error', { member: message.member }))) && console.log(err);
                if (res.data === "An error has occurred while asciifying.") return message.channel.send(new this.client.embed().setDescription(t('commands:ascii.caractere', { member: message.member })));
            })
    }
}

module.exports = Ascii