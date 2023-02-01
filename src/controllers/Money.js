const interval = 24 * 60 * 60 * 1000
const moment = require('moment');
const { set } = require('lodash');
moment.locale('pt-br')

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return hours.toString().replace('0-', '') + 'h ' + minutes.toString().replace('0-', '') + 'm ' + seconds.toString().replace('0-', '') + 's';
}

module.exports = class MoneyController {
  constructor(client, database) {
    this.client = client
    this.database = database
    this.controllerName = 'money'
  }

  async canGetDaily(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/daily`).once('value')
    const boolean = Date.now() < (interval + db.val())

    if (!db.val()) return { can: true }

    const value = Date.now() - (interval + db.val())

    const remain = moment.duration(interval - (Date.now() - db.val())).format('h[h] m[m] s[s]')

    if (boolean) return { can: false, remain }
    else return { can: true }
  }

  async getBalance(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/coins`).once('value')

    return db.val() ? db.val() : 0
  }

  async getInteligence(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/inteligence`).once('value')

    return db.val() ? db.val() : 0
  }

  async setInteligence(user, amount) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/inteligence`).once('value')
    await this.database.ref(`SwiftBOT/Economia/${user}/inteligence`).set(db.val() +amount)

    return db.val() ? db.val() : 0
  }

  async jailed(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/jailed`).once('value')

    return db.val() || false;
  }

  async getDaily(user) {
    await this.database.ref(`SwiftBOT/Economia/${user}/daily`).set(Date.now())

    const ref = (await this.database.ref(`SwiftBOT/users/${user}/dailyStreak`).once('value')).val()

    console.log(`SwiftBOT/users/${user}/dailyStreak`)
    if (ref === 10) await this.database.ref(`SwiftBOT/users/${user}/dailyStreak`).set(1)
    else await this.database.ref(`SwiftBOT/users/${user}/dailyStreak`).set(ref+1)
    
    const amount = Math.floor(Math.random() * 5000) + 8

    await this.setBalance(user, amount)
    return amount
  }

  async setBalance(user, amount) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/coins`).once('value')

    await this.database.ref(`SwiftBOT/Economia/${user}/coins`).set(db.val() + amount)

    return db.val()
  }

  async setBalanceInBank(user, amount) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/bank`).once('value')

    await this.database.ref(`SwiftBOT/Economia/${user}/bank`).set(db.val() + amount)

    return db.val() || 0
  }

  async hasBank(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/bank`).once('value')

    if (db.val() === false || db.val() === null) return false
    else return true
  }

  async getBalanceInBank(user) {
    const res = await this.hasBank(user)
    if (!res) return res

    const db = await this.database.ref(`SwiftBOT/Economia/${user}/bank`).once('value')

    return db.val() ? db.val() : 0
  }

  async buyBank(user) {
    await this.database.ref(`SwiftBOT/Economia/${user}/bank`).set(0)
  }

  async debit(user, amount) {
    await this.setBalance(user, +amount)
    await this.setBalanceInBank(user, -amount)
  }

  async deposit(user, amount) {
    await this.setBalance(user, -amount)
    await this.setBalanceInBank(user, +amount)
  }

  async jail(user) {
    await this.database.ref(`SwiftBOT/Economia/${user}/jailed`).set(true)
  }

  async unJail(user) {
    await this.database.ref(`SwiftBOT/Economia/${user}/jailed`).set(false)
  }

  async transf(user1, user2, amount) {
    await this.setBalance(user1, -amount)
    await this.setBalance(user2, +amount)
  }
  
  async getRank(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/rank`).once('value')
    
    return db.val() || 0
  }

  async setRank(user, rank = 0) {
    await this.database.ref(`SwiftBOT/Economia/${user}/rank`).set(rank)
  }
}