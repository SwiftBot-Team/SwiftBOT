const Base = require("../../services/Command");

const { get } = require('axios');

class src extends Base {
    constructor(client) {
        super(client, {
            name: "src",
            description: "descriptions:src",
            category: "categories:utils",
            usage: "usages:src",
            cooldown: 3000,
            aliases: ["source", 'codigo'],
            permissions: [],
            bot_permissions: []
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return message.respond('Insira o nome de um arquivo para eu pesquisar!');

        const name = args[0].toLowerCase();

        const queryString = 'q=' + encodeURIComponent(`repo:SwiftBot-Team/SwiftBOT filename:${name}`);

        const allFiles = await get(`https://api.github.com/search/code?${queryString}`).then(res => res.data.items);

        const files = allFiles.filter(f => f.name.toLowerCase() === name || f.name.toLowerCase().includes(name));

        if (!files.length) return message.respond('Não encontrei nenhum arquivo relacionado à este nome.');

        if (files.length === 1) {
            const file = await get(`https://api.github.com/repos/SwiftBot-Team/SwiftBOT/contents/${files[0].path}`).then(res => res.data);

            return message.quote('Visualize abaixo o código fonte do arquivo.', {
                files: [{
                    attachment: Buffer.from(file.content, 'base64'),
                    name: file.name
                }]
            })
        } else {
            const embed = new this.client.embed()
                .setAuthor('Insira o número correspondente ao arquivo desejado.', this.client.user.displayAvatarURL())
                .setDescription(files.slice(0, 10).map((f, i) => `${i + 1} - [${f.path}](${f.html_url})`).join('\n'))
                .setFooter('SwiftBOT', this.client.user.displayAvatarURL());

            const msg = await message.quote(embed);

            msg.channel.createMessageCollector(m => m.author.id === message.author.id && !isNaN(m.content) && Number(m.content) > 0 && Number(m.content) <= 10 && Number(m.content) <= files.length, { max: 1 })

                .on('collect', async ({ content }) => {

                    const file = await get(`https://api.github.com/repos/SwiftBot-Team/SwiftBOT/contents/${files[Number(content) - 1].path}`).then(res => res.data);

                    return message.quote('Visualize abaixo o código fonte do arquivo.', {
                        files: [{
                            attachment: Buffer.from(file.content, 'base64'),
                            name: file.name
                        }]
                    })
                })
        }

    }
}

module.exports = src
