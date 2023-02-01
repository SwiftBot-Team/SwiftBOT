const Base = require("../../services/Command");
const { create, all } = require('mathjs')

const math = create(all)
const limitedEvaluate = math.evaluate

math.import({
    'import': function () { },
    'createUnit': function () { },
    'evaluate': function () { },
    'parse': function () { },
    'simplify': function () { },
    'derivative': function () { },
    'format': function () { },
    'ones': function () { },
    'zeros': function () { },
    'identity': function () { },
    'range': function () { },
    'matrix': function () { }
}, { override: true })

class CalculadoraTeste extends Base {
    constructor(client) {
        super(client, {
            name: "calcteste",
            description: "descriptions:calculadora",
            category: "categories:utils",
            usage: "usages:calculadora",
            cooldown: 1000,
            aliases: []
        })
    }

    async run({ message, args, prefix }, t) {

        const initial = args.slice(0).join("");

        let registry = [];

        let result;

        const { MessageButton, MessageActionRow } = this.client.buttons;

        const [zero, one, two, three, four, five, six, seven, eight, nine] = Array(10).fill(true).map((e, i) => new MessageButton().setStyle('gray').setID(`${i}`).setLabel(`${i}`));

        const special = {
            '+': new MessageButton().setStyle('blurple').setID('+').setLabel('+'),
            '-': new MessageButton().setStyle('blurple').setID('-').setLabel('-'),
            '*': new MessageButton().setStyle('blurple').setID('*').setLabel('*'),
            '÷': new MessageButton().setStyle('blurple').setID('÷').setLabel('÷'),
            'clear': new MessageButton().setStyle('red').setID("CE").setLabel('CE'),
            'back': new MessageButton().setStyle('red').setID('←').setLabel('←'),
            '.': new MessageButton().setStyle('gray').setID('.').setLabel('.'),
            '=': new MessageButton().setStyle('blurple').setID('=').setLabel('='),
            '√': new MessageButton().setStyle('blurple').setID('√').setLabel('√'),
            '()': new MessageButton().setStyle('gray').setID('()').setLabel('( )'),
            '^': new MessageButton().setStyle('blurple').setID('^').setLabel('^'),
            none: new MessageButton().setStyle('gray').setID('none').setLabel(' ')
        };

        const board = Array(4).fill(true).map(e => new MessageActionRow());

        board[0].addComponents([seven, eight, nine, special['÷'], special['back']])
        board[1].addComponents([four, five, six, special['*'], special['clear']])
        board[2].addComponents([one, two, three, special['-'], special['√']])
        board[3].addComponents([special['()'], zero, special['.'], special['+'], special['^']])

        const embed = new this.client.embed()
            .addField('Entrada', `\`\`\`\n0\`\`\` `, true)
            .addField('Saída', `\`\`\`0\`\`\` `, true)

        message.channel.send({
            components: board,
            embed
        }).then(msg => {
            const collector = msg.createButtonCollector(button => button.clicker.user.id === message.author.id, { cooldown: 1000 })

                .on('collect', async (button) => {

                    button.reply.defer();

                    if (button.id === 'none') return;

                    if (button.id === '√' && registry[registry.length - 1] !== 'sqrt(') {
                        registry.push('sqrt(');

                        embed.fields[0].value = `\`\`\`\n${registry.join(" ") || '0'}\`\`\` `;

                        return msg.edit({ embed, components: board });
                    }

                    if (!Number(button.id) && registry[registry.length - 1] === 'sqrt(') return;

                    if (button.id === 'CE') {
                        registry = [];

                        embed.fields[0].value = `\`\`\`\n0\`\`\` `;
                        embed.fields[1].value = `\`\`\`\n0\`\`\` `;

                        return msg.edit({ embed, components: board })
                    } else if (button.id === '←') {
                        registry.pop();

                        embed.fields[0].value = `\`\`\`\n${registry.join(" ") || '0'}\`\`\` `;

                        if (!registry.length) {
                            embed.fields[0].value = `\`\`\`\n${registry.join(" ") || '0'}\`\`\` `;
                            embed.fields[1].value = `\`\`\`\n0\`\`\` `;

                            return msg.edit({ embed, components: board })
                        }

                        try {
                            const result = limitedEvaluate(registry.join(" "));

                            embed.fields[1].value = `\`\`\`\n${result}\`\`\` `;
                        } catch (err) {
                            embed.fields[1].value = `\`\`\`\nResultado inválido\`\`\` `;
                        }

                        return msg.edit({ embed, components: board })
                    } else {

                        if ((!isNaN(registry[registry.length - 1]) && !isNaN(button.id)) || (!isNaN(registry[registry.length - 1])) && button.id === '.') registry[registry.length - 1] += button.id;
                        else {

                            if (registry.length && !isNaN(button.id) && registry[registry.length - 1].includes('sqrt(')) {
                                if (registry[registry.length - 1].length >= 6) {
                                    const numbers = registry[registry.length - 1].match(/[0-9]/gi);

                                    registry[registry.length - 1] = `sqrt(${numbers.join("") + button.id})`
                                } else registry[registry.length - 1] += button.id + ')'

                            } else if (['+', '-', '*', '÷', '=', '√', '^'].includes(button.id) && ['+', '-', '*', '÷', '=', '√', '^'].includes(registry[registry.length - 1])) {
                                return;

                            } else if (button.id === '()') {

                                if (registry.length && registry[registry.length - 1].startsWith('(')) {

                                    registry[registry.length - 1] += ')';
                                }
                                else registry.push('(');
                            } else if (registry.length && (registry[registry.length - 1].match(/\([^]+/gi) || registry[registry.length - 1] === '(') && !registry[registry.length - 1].endsWith(')')) {
                                let r = registry[registry.length - 1];
                                let arrayRegistry = r.split("");
                                if (isNaN(arrayRegistry[arrayRegistry.length - 1]) && ['+', '-', '*', '÷', '=', '√', '^'].includes(button.id)) return;

                                r.length === 1 ? registry[registry.length - 1] += button.id : registry[registry.length - 1] +=
                                    !isNaN(arrayRegistry[arrayRegistry.length - 1]) ? !isNaN(button.id) ? button.id : ` ${button.id === '÷' ? '/' : button.id}` : ` ${button.id}`
                            } else registry.push(button.id === '÷' ? '/' : button.id);
                        }

                        embed.fields[0].value = `\`\`\`\n${registry.join(" ") || '0'}\`\`\` `;

                        if (!['+', '-', '*', '÷', '=', '√', '^'].includes(button.id)) {

                            try {
                                const result = limitedEvaluate(registry.join(" "));

                                embed.fields[1].value = `\`\`\`\n${result}\`\`\` `;
                            } catch (err) {
                                embed.fields[1].value = `\`\`\`\nResultado inválido\`\`\` `;
                            }
                        }

                        return msg.edit({ embed, components: board })
                    }
                })
        })
    }
}
module.exports = CalculadoraTeste