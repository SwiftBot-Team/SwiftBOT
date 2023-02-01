const { stdTransformDependencies } = require("mathjs");
const Base = require("../../services/Command");

const FileUtils = require('../../utils/FileUtils')

const Locale = require('../../../lib');


class Reload extends Base {
    constructor(client) {
        super(client, {
            name: "reload",
            description: "descriptions:reloadcmd",
            category: "categories:devs",
            cooldown: 1000,
            aliases: ['reloadcmd'],
            devsOnly: true,
            hidden: true
        });
    }

    async run({ message, args, prefix }, t) {

        if (!args[0]) return message.respond(`Você deve inserir um tipo! [command|event|api|controller]`);

        if (['event', 'evento', 'evt'].includes(args[0].toLowerCase())) {
            const eventName = args[1];
            if (!eventName) return message.respond('Você deve inserir o nome do evento!');

            try {
                delete require.cache[require.resolve(`../../../src/events/` + eventName.replace('.js', '') + '.js')];

                const event = new (require(`../../../src/events/` + eventName.replace('.js', '') + '.js'))(this.client);

                this.client.events.splice(this.client.events.indexOf(this.client.events.find(e => e.name === eventName.replace('.js', ''))), 1);

                this.client.events.push(event)

                return message.respond('Evento reiniciado com sucesso.')
            }
            catch (err) {
                console.log(err)
                message.respond('Não encontrei este evento.')
            }
        }

        if (['command', 'comando', 'cmd'].includes(args[0].toLowerCase())) {
            const commandName = args[1];
            
            if(commandName.includes('/commands/')) {
                const command = require(commandName);
                
                command.prototype.path = commandName;
                
                this.client.commands.push(new command(this.client));
                
                return message.respond('Comando criado com sucesso.')
            }
            
            if (!commandName) return message.respond('Você deve inserir o nome do comando!')

            const command = this.client.commands.find(c => c.help.name === commandName || (c.conf.aliases && c.conf.aliases.includes(commandName)));

            if (!command) return message.respond('Comando não encontrado.');
            
            const slash = await this.client.api.applications(this.client.user.id).commands.get();
            

            delete require.cache[require.resolve(command.path)];

            const newCommand = require(command.path);

            newCommand.prototype.path = command.path;
            
            const n = new newCommand(this.client)
            
            if(slash.find(e => e.name === command.help.name) || (n.help.slash === true || n.help.options.length)) {
                
                const l = new Locale('src/languages', {
                    returnUndefined: false,
                    defaultLanguage: 'pt',
                    debug: false
                });
                
                await l.init();
                
                l.setLang('en');
                
                let newT = l.t.bind(l);
                
                if(slash.find(e => e.name === command.help.name)) {
                    const findSlash = slash.find(e => e.name === command.help.name);
                    
                    const oldCommand = JSON.stringify(findSlash);
                    
                    const newC = JSON.stringify({ ...newCommand.help, id: findSlash.id, application_id: findSlash.application_id, version: findSlash.version });
                    if(oldCommand !== newC) {
                		this.client.api.applications(this.client.user.id).commands(slash.find(e => e.name === command.help.name).id).patch({ data: { ...n.help, description: newT(n.help.description) } });
                        message.respond('Configuração slash do comando editada.')
                    }
                } else if((command.help.slash === false && n.help.slash === true) || !command.help.options.length && n.help.options.length) {
                		this.client.api.applications(this.client.user.id).commands.post({ data: { ...n.help, description: newT(n.help.description) } });
                    	message.respond('Configuração slash do commando criada.')
                }
            }

            await this.client.commands.splice(this.client.commands.indexOf(command), 1);
            await this.client.commands.push(n);

            message.respond('Comando recarregado.')
        }

        if (['apis', 'api'].includes(args[0].toLowerCase())) {
            const apiName = args[1];
            if (!apiName) return message.respond('Você deve inserir o nome da API!');

            const api = this.client.apis[apiName];

            if (!api) return message.respond('Essa API não existe!');

            delete require.cache[require.resolve(api.path)];

            const newApi = require(api.path);

            newApi.prototype.path = api.path

            this.client.apis[apiName] = new newApi(this.client);

            message.respond('API recarregada com sucesso.')
        }

        if (['controller', 'controllers'].includes(args[0].toLowerCase())) {
            const controllerName = args[1];

            if (!controllerName) return message.respond('Você deve inserir o nome do controller!');

            if (!this.client.controllers[controllerName]) return message.respond('Não foi possível encontrar este controller.');

            const controller = this.client.controllers[controllerName];

            delete require.cache[require.resolve(controller.path)];

            const newController = require(controller.path);

            newController.prototype.path = controller.path;

            this.client.controllers[controllerName] = new newController(this.client);

            return message.respond('Controller recarregado com sucesso.')
        }
    }
}

module.exports = Reload;