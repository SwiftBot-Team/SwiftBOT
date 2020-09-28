const Base = require("../../services/Command");

class Dado extends Base {
    constructor(client) {
        super(client, {
            name: "dado",
            description: "descriptions:dado",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["coc"]
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) args[0] = 6
        if (Number(args[0]) > 999999 || Number(args[0]) < 1) return message.channel.send(new this.client.embed().setDesription(t('commands:dado.grande')))

        let result = (Math.floor(Math.random() * Math.floor(args[0])));
        message.channel.send(new this.client.embed().setDescription(`<:alert:697424337254350928> ${t('commands:dado.result', { faces: args[0], result: result + 1 })}`));
    }
}
module.exports = Dado;