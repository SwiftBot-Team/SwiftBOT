const interval = 24 * 60 * 60 * 1000

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours.toString().replace('0-', '') + 'h ' + minutes.toString().replace('0-', '') + 'm ' + seconds.toString().replace('0-', '') + 's';
}

module.exports = class MoneyController {
  constructor (client, database) {
    this.client = client
    this.database = database
    this.controllerName = 'money'
  }

  async canGetDaily(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/daily`).once('value')
    const boolean = Date.now() < (interval + db.val())

    if (!db.val()) return { can: true }
    
    
    const remain = msToTime(Date.now() - (interval + db.val()))
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

  async jailed(user) {
    const db = await this.database.ref(`SwiftBOT/Economia/${user}/jailed`).once('value')

    return db.val() || false;
  }  

  async getDaily(user) {
    await this.database.ref(`SwiftBOT/Economia/${user}/daily`).set(Date.now())

    const amount = Math.floor(Math.random() * 1000) + 8

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
    
    return db.val()
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

    return db.val()
  }

  async buyBank(user) {
    await this.setBalance(user, -5000)
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
}