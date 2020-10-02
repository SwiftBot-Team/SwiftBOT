const Base = require("../../services/Command");
const weather = require("weather-js")

class Wheater extends Base {
  constructor(client) {
    super(client, {
      name: "wheater",
      description: "descriptions:wheater",
      category: "categories:utils",
      usage: "usages:wheater",
      cooldown: 5000,
      aliases: ["clima"]
    })
  }

  async run({ message, args, prefix }, t) {
    const local = args.join(' ')

    if (!local) return this.respond(t('commands:weather.error'))

    weather.find({ search: local, degreeType: 'C' }, (error, result) => {
      if (error) return this.respond('commands:weather.cityError')
      if (!result.length) return this.respond('n tem');

      const {
        location: { timezone },
        current: {
          humidity,
          temperature,
          imageUrl,
        }
      } = result[0];

      const Embed = new this.client.embed()
        .setTitle(result[0].current.observationpoint)
        .setThumbnail(imageUrl)
        .addField(t('commands:weather.tempo'), `UTC ${timezone}`)
        .addField(t('commands:weather.temp'), `${temperature} ºC`)
        .addField(t('commands:weather.hum'), `${humidity}%`)
      return message.channel.send(Embed)
    })
  }
}
module.exports = Wheater