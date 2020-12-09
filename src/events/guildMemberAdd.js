const Mail = require('../services/Mail')
const { convertHourToMinutes, msToTime } = require('../utils/index')

module.exports = class {
  constructor(client) {
    this.client = client;
  }
  async run(member) {
    const t = await this.client.getTranslate(member.guild)

    const db = await this.client.database.ref(`Servidores/${member.guild.id}/autorole`).once('value')

    if (!db.val()) return

    const InvalidRoles = []

    for (const i in db.val()) {
      if (!member.guild.roles.cache.get(db.val()[i])) {
        InvalidRoles.push(db.val()[i])
        continue;
      }

      member.roles.add(db.val()[i]);
    }
  }

}