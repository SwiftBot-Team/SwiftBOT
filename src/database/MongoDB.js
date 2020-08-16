const mongoose = require('mongoose')

module.exports = class {
    constructor(client) {
        this.client = client;
        this.instance = client.instance;
    }
    run() {
        const dbOptions = {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            autoIndex: false,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        };

        mongoose.connect(process.env.MONGO_URL, dbOptions)
        mongoose.set('useFindAndModify', false);

        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            this.client.log('MongoDB Conectado com Sucesso!', { color: 'green', tags: ['Database'] })
        });

        mongoose.connection.on('err', err => {
            this.client.log('Erro ao conectar a database \n\n'+err, { color: 'red', tags: ['Database'] })
        });

        mongoose.connection.on('disconnected', () => {
            this.client.log('MongoDB desconectado com Sucesso!', { color: 'yellow', tags: ['Database'] })
        });
    }
};