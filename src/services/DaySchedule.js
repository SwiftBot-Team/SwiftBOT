const nodeCron = require('node-cron')
const { EventEmitter } = require('events')

module.exports = new class DaySchedule extends EventEmitter {

    async init() {
        nodeCron.schedule("* */60 * * * *", () => {
            this.emit('day_change')
        })

        return this
    }
}