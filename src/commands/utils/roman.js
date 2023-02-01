const Base = require("../../services/Command");
const Converter = require('../../services/Converter')

class Roman extends Base {
  constructor(client) {
    super(client, {
      name: "roman",
      description: "descriptions:roman",
      category: "categories:utils",
      usage: "usages:roman",
      cooldown: 1000,
      aliases: ['romano', 'nromano', 'n-romano']
    })
  }

  async run({ message, args, prefix }, t) {
    const options = [
      {
        arg: 'encode',
        exec: (text) => Converter.decimalToRoman(text),
        message: (text) => t('commands:roman.encode', { text }),
        verify: (text) => {
          if (isNaN(Number(text))) {
            return false
          }

          return true
        }
      },
      {
        arg: 'decode',
        exec: (text) => Converter.romanToDecimal(text),
        message: (text) => t('commands:roman.decode', { text }),
        verify: (text) => {
          if (/^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/gm.test(text)) {
            return true
          }

          return false
        }
      }
    ]

    options.map(option => {
      if (!args.slice(1).join(" ")) return message.respond(t('commands:roman.invalid'))

      if (args[0].toLowerCase() === option.arg) {
        if (!option.verify(args.slice(1).join(" "))) return message.respond(t('commands:roman.invalid'))

        return message.respond(option.message(option.exec(args.slice(1).join(" "))))
      }
    })

    if (!options.map(o => o.arg).includes(args[0])) {
      return message.respond(t('commands:roman.error'))
    }
  }
}
module.exports = Roman