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

class Calculadora extends Base {
  constructor(client) {
    super(client, {
      name: "calculadora",
      description: "descriptions:calculadora",
      category: "categories:utils",
      usage: "usages:calculadora",
      cooldown: 1000,
      aliases: ['calcular', 'math', 'calc']
    })
  }

  async run({ message, args, prefix }, t) {
    const Embed = new this.client.embed(message.author)

    if (!args[0]) return this.respond(t('commands:calculadora.exError'))

    const expression = args.join(' ').replace(':', '/')

    try {

      const result = limitedEvaluate(expression);
      console.log(typeof result)
      if (['array', 'object', 'function', 'string'].includes(typeof result) || !result) return this.respond(t('commands:calculadora.error'))

      Embed
        .setTitle(t('commands:calculadora.confirm', { e: expression, r: result }))
        .setThumbnail('https://cdn.discordapp.com/emojis/754843351152590898.png?v=1')

      message.channel.send(Embed)

    } catch (error) {
      this.client.instance.error(`Um erro ocorreu na guila ${message.guild.id}, ao executar o comando MATH`)
      this.respond(t('commands:calculadora.error'))
    }
  }
}
module.exports = Calculadora