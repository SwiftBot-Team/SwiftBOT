const { EventEmitter } = require('events')

module.exports = class Instance extends EventEmitter {
    async log(type, data) {
        this.emit(type, data ? data : null)
    }
}
