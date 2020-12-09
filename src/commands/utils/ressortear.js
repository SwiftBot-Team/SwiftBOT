const Base = require("../../services/Command");

const ms = require('ms');

class Ressortear extends Base {
    constructor(client) {
        super(client, {
            name: "ressortear",
            description: "descriptions:ressortear",
            category: "categories:utils",
            usage: "usages:ressortear",
            cooldown: 1000,
            aliases: ["gerrol"],
            permissions: ['MANAGE_GUILD']
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return this.respond(t('commands:ressortear.noArgs', { member: message.author.id }));

        this.client.controllers.sorteios.reroll(args[0], {
            messages: {
                congrat: t('commands:ressortear.sucess'),
                error: t('commands:ressortear.error')
            }
        }).then().catch(err => this.respond(t('commands:ressortear.noGiveawayFound', { member: message.author.id })))

    }
}

module.exports = Ressortear;