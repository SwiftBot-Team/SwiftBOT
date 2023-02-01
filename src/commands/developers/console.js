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
            devsOnly: true,
            hidden: true
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args.join(' ')) return message.respond('Você não inseriu o que deseja fazer.');

        const { exec } = require('child_process');

        exec(args.join(" "), (err, stdout, stderr) => {
            const result = stdout || stderr;
            
            return message.quote(`\`\`\`\n${result}\`\`\` `).catch(err => {
                return message.quote({
                    files: [
                        {
                            attachment: Buffer.from(result),
                            name: 'console.txt'
                        }
                    ]
                })
            })
        })
    }
}

module.exports = Console
