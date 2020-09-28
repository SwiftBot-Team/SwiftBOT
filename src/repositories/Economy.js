const User = require('../database/models/User')

module.exports = new class Economy {
  constructor (user) {
    this.user = user
  }

  async verifyAccount() {
    const user = await User.findOne({ userID: this.user.id })

    if (!user) {
      await User.create({
        userID: this.user.id,
        mails: [],
        jail: false,
        coins: 0,
        hasBank: false,
        bank: 0
      })
    }

    if (!user.jail) {
      user.jail = false;
      user.save();
    } 

    if (!user.coins) {
      user.coins = 0;
      user.save();
    }

    if (!user.hasBank) {
      user.hasBank = false;
      user.save();
    }

    if (!user.bank) {
      user.bank = 0;
      user.save()
    }

    return user
  }

  async getCoins() {
    const user = await this.verifyAccount()

    return user.coins
  }

  async hasBank() {
    const user = await this.verifyAccount()

    return user.hasBank
  }

  async getBankValue() {
    const user = await this.verifyAccount()
    if (!await this.hasBank()) return false

    return user.bank
  }
  
  async isJail() {
    const user = await this.verifyAccount()

    return user.jail
  }

  async jail() {
    const user = await this.verifyAccount()

    user.jail = true;
    user.save()

    return undefined;
  }

  async deposit(amount) {
    const user = await this.verifyAccount()
    if (!this.hasBank()) return false
  }
}