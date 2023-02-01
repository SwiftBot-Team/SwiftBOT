module.exports = class {
    constructor(client) {
        this.client = client;
        this.name = 'messageUpdate'
    }
    async run(oldMessage, newMessage) {

        if (oldMessage.content === newMessage.content) return;

        this.client.emit('message', newMessage)
    }
}