const FileUtils = require('../utils/FileUtils')

module.exports = new class Modules {
  async load(client) {
    return FileUtils.requireDirectory('./src/modules', (Module) => {
      new Module(client).run()
    }, client.log('Loaded', { color: 'green', tags: ['Modules'] }))
  }
}