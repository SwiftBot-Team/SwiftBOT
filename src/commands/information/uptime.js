const Base = require("../../services/Command");

class Uptime extends Base {
  constructor(client) {
    super(client, {
      name: "uptime",
      description: "descriptions:uptime",
      category: "categories:info",
      cooldown: 1000,
      aliases: ["online", "online-time"]
    });
  }

  run({ message, args, prefix }, t) {
    function convertMS(ms) {
      var d, h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;

      return {
        d: d
        , h: h
        , m: m
        , s: s
      };
    };

    let u = convertMS(this.client.uptime)
    let ontime = t('commands:uptime.time', { u: u })

    message.respond(`<:infos:747238192956178493> | **${message.author.username}**, ${t('commands:uptime.online')} ${ontime}`)
  }
}

module.exports = Uptime;