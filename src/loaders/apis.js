const FileUtils = require('../utils/FileUtils')

module.exports = new class Modules {
    async load(client) {
        return FileUtils.requireDirectory('./src/apis', (Module) => {
            const api = new Module(client);

            if (!client.apis) client.apis = {};

            client.apis[api.name] = api
        }, client.log('Loaded', { color: 'green', tags: ['Apis'] }))
    }
}