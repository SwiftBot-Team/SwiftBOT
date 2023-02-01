const FileUtils = require('../utils/FileUtils')

module.exports = new class Emoji {
    async load(client) {
        return FileUtils.requireDirectory('src/controllers', (Controller) => {
            const controller = new Controller(client, client.database)

            client.controllers[controller.controllerName] = controller
        })
    }
}