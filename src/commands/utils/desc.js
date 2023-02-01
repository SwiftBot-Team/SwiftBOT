const Base = require("../../services/Command");
const { convertMS } = require('../../utils')

class Desc extends Base {
  constructor(client) {
    super(client, {
      name: "desc",
      description: "descriptions:desc",
      category: "categories:utils",
      usage: "usages:desc",
      cooldown: 1000,
      aliases: ['ver-desc', 'description', 'sobre', 'about']
    })
  }

  async run({ message, args, prefix }, t) {
    const user = this.getUsers()[0] || message.author

    this.client.database.ref(`SwiftBOT/users/${user.id}/about`)
      .once("value").then(async (db) => {
        if (!db.val()) {
          return message.respond(t('commands:desc.noset', { user: user.username||user.user.username }), false)
        } else {
          return message.respond(t('commands:desc.text', { 
            user: user.username||user.user.username, 
            text: db.val().text, 
            lastTime: convertMS(Date.now() - db.val().time)
          }))
        }
      })
  }
}
module.exports = Desc