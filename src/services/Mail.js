const User = require('../database/models/User')
const { msToTime } = require('../utils/index')

module.exports = new class Mail {
  async send(userId, content) {
    if (!await User.findOne({ userID: userId })) {
      await User.create({
        userID: userId,
        mails: [
          {
            id: 1,
            content
          }
        ]
      })

      return
    }

    const user = await User.findOne({ userID: userId })

    let id = await User.count({ userID: userId })+1

    user.mails.push({
      id,
      content
    })
    
  }

  async getMails(userId, page) {

    const user = await User.findOne({ userID: userId })
    
    if (!user) return null
  
    const paginated = user.mails.slice((page - 1) * 5, page * 5);

    if (!paginated === []) return null

    return paginated
  }
}