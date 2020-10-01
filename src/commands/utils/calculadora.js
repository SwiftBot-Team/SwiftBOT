const Base = require("../../services/Command");
const { create, all } = require('mathjs')

const math = create(all)
const limitedEvaluate = math.evaluate

math.import({
  'import':     function () { throw new Error('Function import is disabled') },
  'createUnit': function () { throw new Error('Function createUnit is disabled') },
  'evaluate':   function () { throw new Error('Function evaluate is disabled') },
  'parse':      function () { throw new Error('Function parse is disabled') },
  'simplify':   function () { throw new Error('Function simplify is disabled') },
  'derivative': function () { throw new Error('Function derivative is disabled') },
  'format':     function () { throw new Error('Function format is disabled') }
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
    const expression = args.join(' ')

    if (!expression) return this.respond(t('commands:calculadora.exError'))

    try {
      const result = limitedEvaluate(expression)
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