const { stdTransformDependencies } = require("mathjs");
const Base = require("../../services/Command");

class Console extends Base {
    constructor(client) {
        super(client, {
            name: "console",
            description: "descriptions:console",
            category: "categories:devs",
            cooldown: 1000,
            aliases: [],
            devsOnly: true
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args.join(' ')) return this.respond('Você não inseriu o que deseja fazer.');

        const { exec } = require('shelljs');

        const execute = await exec(args.join(" "));

        if (execute.code === 0) message.channel.send(execute.stdout + execute.stderr, { code: 'js' });

        if (execute.code === 1) message.channel.send(execute.stderr, { code: 'js' });
    }
}

module.exports = Console
