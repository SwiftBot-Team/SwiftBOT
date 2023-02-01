const Base = require("../../services/Command");

class Dado extends Base {
    constructor(client) {
        super(client, {
            name: "dado",
            description: "descriptions:dado",
            category: "categories:fun",
            cooldown: 1000,
            aliases: ["dice"],
            usage: 'usages:dado',
            options: [{
              name: 'sides',
              description: 'Number of sides of the dice',
              type: 4,
              required: false
            }]
        });
    }

    async run({ message, args, prefix }, t) {
        if (!args[0]) args[0] = 6
        if (Number(args[0]) > 999999 || Number(args[0]) < 1) return message.respond(new this.client.embed().setDesription(t('commands:dado.grande')))

        let result = (Math.floor(Math.random() * Math.floor(args[0])));
        message.respond(new this.client.embed().setDescription(`<:badgeA:795773919465963551> ${t('commands:dado.result', { faces: args[0], result: result + 1 })}`));
    }
}
module.exports = Dado;