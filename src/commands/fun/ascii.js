const Base = require("../../services/Command");

class Ascii extends Base {
    constructor(client) {
        super(client, {
            name: "ascii",
            description: "descriptions.ascii",
            category: "categories.fun",
            cooldown: 1000,
            aliases: ["ascii-art"],
            permissions: [],
            bot_permissions: [],
            hidden: false,
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args.join(' ')) return message.channel.send(new this.client.embed().setDescription(t('commands:ascii.args_error', {member: message.member})));

        const request = require('request');
      
        request(`http://artii.herokuapp.com/make?text=${args.join(' ')}&font=doom`, (err, response, body) => {

            if (err) return message.channel.send(new this.client.embed().setDescription(t('commands:ascii.error', {member: message.member}))) && console.log(err);

            if (body === "An error has occurred while asciifying.") return message.channel.send(new this.client.embed().setDescription(t('commands:ascii.caractere', {member: message.member})));
          
            message.channel.send(body, {
               code: 'md'
            });

        })

    }
}

module.exports = Ascii