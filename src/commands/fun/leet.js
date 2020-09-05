const Base = require("../../services/Command");

class Leet extends Base {
  constructor(client) {
    super(client, {
      name: "leet",
      description: "descriptions:leet",
      category: "categories:fun",
      cooldown: 1000,
      aliases: ["leet-text"],
    });
  }

  async run({ message, args, prefix }, t) {

    if (!args[0]) return message.channel.send(new this.client.embed().setDescription(t('commands:leet.noArgs', {member: message.author.id})))


    const caracteres = {
      a: { soft: '4', hard: '4' },
      b: { soft: 'B', hard: 'I3' },
      c: { soft: 'C', hard: '[' },
      d: { soft: 'D', hard: '|)' },
      e: { soft: '3', hard: '3' },
      f: { soft: 'F', hard: '|=' },
      g: { soft: 'G', hard: '6' },
      h: { soft: 'H', hard: '#' },
      i: { soft: '1', hard: '1' },
      j: { soft: 'J', hard: ']' },
      k: { soft: 'K', hard: '|<' },
      l: { soft: 'L', hard: '1' },
      m: { soft: 'M', hard: '/\\/\\' },
      n: { soft: 'N', hard: '|\\|' },
      o: { soft: '0', hard: '0' },
      p: { soft: 'P', hard: '|>' },
      q: { soft: 'Q', hard: '0_' },
      r: { soft: 'R', hard: 'I2' },
      s: { soft: 'S', hard: '5' },
      t: { soft: 'T', hard: '7' },
      u: { soft: 'U', hard: '(_)' },
      v: { soft: 'V', hard: '\\/' },
      w: { soft: 'W', hard: '\\/\\/' },
      x: { soft: 'X', hard: '><' },
      y: { soft: 'Y', hard: '`/' },
      z: { soft: 'Z', hard: '2' }
    }

    const leet = args
      .slice(0)
      .join(" ")
      .split('')
      .map(a => {
        const normalizedChar = a.toLowerCase()
        const mappedChar = caracteres[normalizedChar]
        return mappedChar ? mappedChar['soft'] : a
      })

    await message.channel.send(leet.join(''));
  }
}

module.exports = Leet;