const Base = require("../../services/Command");

const { inspect } = require('util');

class Eval extends Base {
  constructor(client) {
    super(client, {
      name: "eval",
      cooldown: 1000,
      category: 'categories:devs',
      aliases: ["exec"],
      devsOnly: true,
      hidden: true
    });
  }

  async run({ message, args, prefix, player }, t) {
    let code = args.join(" ")

    const user = (id) => client.users.find((user) => user.id == id);

    code = code.replace(/^`{3}(js)?|`{3}$/g, '')
    code = code.replace(/<@!?(\d{16,18})>/g, 'user($1)')
    code = code.replace('--nolog', '')

    console.log(code)

    if (!code) return message.reply("Coloque o codigo")

    let result;

    try {
      const evaled = await eval(code);

      result = inspect(evaled, { depth: 0 });
    } catch (error) {
      result = error.toString();
    };

    result = result.replace(/_user\((\d{16,18})\)/g, '<@$1>');

    if (!args.join("").includes('--nolog')) message.channel.send(result, { code: 'js' });
  }
}

module.exports = Eval;