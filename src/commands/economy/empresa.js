const Base = require("../../services/Command");

const { get } = require('axios');

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
};

const moment = require('moment');
moment.locale('pt-br');

class Empresa extends Base {
    constructor(client) {
        super(client, {
            name: "empresa",
            description: "descriptions:empresa",
            category: "categories:economy",
            usage: "usages:empresa",
            cooldown: 1000,
            aliases: ['empresas']
        })
		
		this.defaultConfig = {
			'padaria': {
				worker_name: 'padaria',
				workers: {
					size: 3,
					maxSize: 6,
					worker_level: 1,
					max_worker_level: 5,
					worker_payment: 10,
					worker_payment_multiplier: 1,
					itemValue: 0.5,
					cooldown: 60000
				},
				customers_value: {
					default: 100,
					multiplier: 1
				},
				initial_payment: 820,
				cacheMoney: 0
			},
			'restaurante': {
				worker_name: 'restaurante',
				workers: {
					size: 5,
					maxSize: 10,
					worker_level: 1,
					max_worker_level: 5,
					worker_payment: 10,
					worker_payment_multiplier: 1,
					itemValue: 10,
					cooldown: 60000 * 10
				},
				customers_value: {
					default: 300,
					multiplier: 1
				},
				initial_payment: 1020,
				cacheMoney: 0
			}
		}
    }

    async run({ message, args, prefix }, t) {
		
		const ref = this.client.empresas.get(message.author.id);
		
		if(!args[0] && ref) {
			const { name, saldo, sede, lojas  } = ref;
			
			const d = new Date();
			
			const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getUTCFullYear()} ${d.getUTCHours() - 3}:${d.getUTCMinutes()}`;
			const secondD = `${d.getDate()}/${d.getMonth() + 1}/${d.getUTCFullYear()} 23:59`;
			
			const ms = moment(secondD,"DD/MM/YYYY HH:mm:ss").diff(moment(date,"DD/MM/YYYY HH:mm:ss"));

			const embed = new this.client.embed()
			.setAuthor(name, message.author.displayAvatarURL())
			.addField(`Saldo`, `\`${numberWithCommas(saldo)}\` `, true)
			.addField(`Sede`, `\`${sede}\` `, true)
			.addField(`Lojas`, `\`${lojas ? Object.values(lojas).length : 'Nenhuma'}\`  `, true)
			.addField(`Próxima entrada de dinheiro em:`, `\`${this.client.msToTime(ms)}\` `)
			.setFooter(name, message.author.displayAvatarURL())
			.setTimestamp();
			
			return message.channel.send(embed);
		};
		
		if(!args[0]) return message.respond(`VocÊ deve inserir o que deseja fazer! \`[criar|deletar|criarloja|lojainfo|deletarloja|listarlojas]\` `);
		
		if(!['criar', 'create', 'del', 'deletar', 'createstore', 'criarloja', 'storeinfo', 'lojainfo', 'deletestore', 'delstore', 'deletarloja', 'delloja', 'listarlojas', 'lojalist', 'listarloja'].some(ar => args[0].toLowerCase() === ar)) return message.respond(`Opções inválidas! Opções disponíveis: \`[criar|deletar|criarloja|lojainfo|deletarloja|listarlojas]\` `);
		
		if(['criar', 'create'].some(ar => args[0].toLowerCase() === ar)) {
			
			if(ref) return message.respond(`${message.author}, você já possui uma empresa!`);
			
			const name = args.slice(1).join(" ");
			
			if(!name) return message.respond(`Você deve inserir o nome da empresa!`);
			
			if(name.length >= 25) return message.respond(`O nome da empresa deve ter no máximo 25 caracteres!`);
			
			if(this.client.empresas.first() && this.client.empresas.find(e => e.name == name)) return message.respond(`${message.author}, já existe uma empresa com esse nome.`);

			const msg = await message.respond(`Certo, onde será a sede da sua empresa? Exemplo: São Paulo `);
			
			const collector = msg.channel.createMessageCollector(m => m.author.id === message.author.id, { time: 60000 })
			
			.on('collect', async ({ content }) => {
				if(!isNaN(content)) return message.respond(`Por favor, insira uma cidade válida!`);
				
				if(content.length > 30) return message.respond('Por favor, insira um nome menor.');
				
				collector.stop('limit');
				
				this.client.database.ref(`SwiftBOT/empresas/${message.author.id}`).set({
					name,
					sede: content,
					saldo: 0
				});
				
				this.client.empresas.set(message.author.id, {
					name,
					sede: content,
					saldo: 0,
					lojas: {}
				})
				
				return message.respond(`Empresa criada com sucesso! Use o comando \`${prefix}empresa\` para ver as informações dela. `)
			})
			
			.on('end', async (_, reason ) => {
				if(reason !== 'limit') return message.respond(`Você demorou demais para responder!`);
			})
		};
		
		if(['deletar', 'de'].some(ar => args[0].toLowerCase() === ar)) {
			if(!ref) return message.respond(`${message.author}, você não possui nenhuma empresa!`);
			
			const msg = await message.respond(`Você tem certeza que deseja deletar a empresa?`);
			
			await msg.react('✅');
			await msg.react('❌');
			
			const collector = msg.createReactionCollector((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id === message.author.id, { max: 1, time: 60000 })
			
			.on('collect', async ({ emoji }) => {
				switch(emoji.name) {
					case '✅':
						this.client.database.ref(`SwiftBOT/empresas/${message.author.id}`).remove();
						
						this.client.empresas.delete(message.author.id)
						
						return message.respond('Empresa deletada com sucesso!');
					break;
					
					case '❌':
						return message.respond('Operação cancelada com sucesso.')
					break;
				}
			})
			
			.on('end', async (_, reason) => {
				if(reason !== 'limit') return message.respond(`Você demorou demais para responder!`);
			})
		}
			
		if(['createstore', 'criarloja'].some(ar => args[0].toLowerCase() === ar)) {
			if(!ref) return message.respond(`${message.member}, você precisa criar uma empresa antes!`);
			
			if(Object.values(ref.lojas).length) return message.respond(`${message.author}, no momento não é possível criar lojas.`)
			
			if(!args[1]) return message.respond(`Você precisa inserir o tipo da loja! Tipos disponíveis: \`${Object.keys(this.defaultConfig).join(", ")}\` `);
			
			if(!this.defaultConfig[args[1].toLowerCase()]) return message.respond('Tipo inválido!');
			
			const tipo = this.defaultConfig[args[1].toLowerCase()];
			
			const money = await this.client.controllers.money.getBalance(message.author.id)
			
			if(Number(money) < tipo.initial_payment) return message.respond(`${message.author}, você precisa de mais \`${tipo.initial_payment - Number(money)}\` sCoins para abrir esta loja!`);
			
			const nome = args.slice(2).join(" ");
			
			if(!nome) return message.respond(`${message.member}, você precisa inserir um nome para a loja!`);
			
			if(nome.length > 25) return message.respond(`${message.member}, este nome é grande demais!`);
			
			if(!isNaN(nome)) return message.respond(`${message.member}, este nome é inválido!`);
			
			if(this.client.empresas.first() && this.client.empresas.find(e => Object.values(e.lojas).find(l => l.nome == nome))) return message.respond(`${message.author}, já existe uma empresa com esse nome.`);

			this.client.database.ref(`SwiftBOT/empresas/${message.author.id}/lojas`).push({
				...tipo,
				nome
			}).then(({ path }) => {
				this.client.empresas.get(message.author.id).lojas[path.pieces_[path.pieces_.length - 1]] = {
					...tipo,
					nome
				};
				
				setInterval(() => {
				if(!this.client.empresas.get(message.author.id) || !this.client.empresas.get(message.author.id).lojas[path.pieces_[path.pieces_.length - 1]]) return;
				
				this.client.empresas.get(message.author.id).lojas[path.pieces_[path.pieces_.length - 1]].cacheMoney += tipo.workers.itemValue;
				}, tipo.workers.cooldown)
			
			})
			
			this.client.controllers.money.setBalance(message.author.id, -tipo.initial_payment)
			
			return message.respond(`Loja criada com sucesso!`);
			
		}
		
		if(['deletestore', 'delstore', 'deletarloja', 'delloja'].some(ar => args[0].toLowerCase() === ar)) {
			if(!ref) return message.respond(`${message.member}, você precisa criar uma empresa antes!`);
			
			if(!Object.values(ref.lojas).length) return message.respond(`${message.member}, você não possui nenhuma loja.`);
			
			const name = args.slice(1).join(" ");
			
			if(!name) return message.respond(`${message.member}, você precisa inserir o nome da loja que deseja deletar!`);
			
			if(!Object.values(ref.lojas).find(l => l.nome == name)) return message.respond(`${message.member}, eu não consegui encontrar esta loja.`);
			
			const key = Object.entries(ref.lojas).find(c => c[1].nome == name)[0];
			
			const msg = await message.respond(`${message.member}, você tem certeza que deseja deletar a loja?`);
			
			await msg.react('✅');
			await msg.react('❌');
			
			const collector = msg.createReactionCollector((r, u) => ['✅', '❌'].includes(r.emoji.name) && u.id === message.author.id, { max: 1, time: 60000 })
			
			.on('collect', async ({ emoji }) => {
				switch(emoji.name) {
					case '✅':
						this.client.database.ref(`SwiftBOT/empresas/${message.author.id}/lojas/${key}`).remove();
						
						delete this.client.empresas.get(message.author.id).lojas[key]
						
						return message.respond('Loja deletada com sucesso!');
					break;
					
					case '❌':
						return message.respond('Operação cancelada com sucesso.')
					break;
				}
			})
			
			.on('end', async (_, reason ) => {
				if(reason !== 'limit') return message.respond(`Você demorou demais para responder.`);
			})
		}
		
		if(['investir', 'addmoney'].some(ar => args[0].toLowerCase() === ar)) {
			if(!args[1]) return message.respond(`${message.member}, você deve inserir a quantia!`);
			
			if(isNaN(args[1])) return message.respond(`${message.member}, insira uma quantia válida!`);
			
			const value = Number(args[1]);
			
			if(value < 1) return message.respond(`${message.member}, por favor, insira uma quantia válida!`);
			
			const money = await this.client.controllers.money.getBalance(message.author.id)
			if(money < value) return message.respond(`${message.member}, você não possui isso de dinheiro.`);
			
			this.client.controllers.money.setBalance(message.author.id, -value)
			
			this.client.database.ref(`SwiftBOT/empresas/${message.author.id}/`).update({
				saldo: Number(ref.saldo) + value
			});
			
			return message.respond(`Dinheiro investido com sucesso.`);
		}
		
		if(['lojainfo', 'storeinfo'].some(ar => args[0].toLowerCase() === ar)) {
			if(!ref) return message.respond(`${message.member}, você não possui uma empresa!`);
			
			if(!Object.values(ref.lojas).length) return message.respond(`${message.member}, você não possui nenhuma loja!`);
			
			const loja = Object.values(ref.lojas).find(l => l.nome == args.slice(1).join(" "));
			
			if(!loja) return message.respond(`${message.member}, eu não encontrei nenhuma loja com esse nome.`);
			
			const embed = new this.client.embed()
			.setAuthor(loja.nome, message.author.displayAvatarURL())
			.addField(`Empregados`, `\`${loja.workers.size}/${loja.workers.maxSize}\` **(level ${loja.workers.worker_level})** **(R$${loja.workers.worker_payment * loja.workers.worker_payment_multiplier}% do saldo para cada)** `, true)
			.addField(`Custo para se manter`, `\`R$${loja.customers_value.default * loja.customers_value.multiplier} por dia\` `, true)
			.addField(`Valor arrecadado hoje: `, `\`R$${loja.cacheMoney ? loja.cacheMoney : 0}\` `, true)
			.setFooter(loja.nome, message.author.displayAvatarURL())
			.setTimestamp()
			
			return message.channel.send(embed)
		}
		
		if(['lojalist', 'listarloja', 'listarlojas'].some(ar => args[0].toLowerCase() === ar)) {
			if(!ref) return message.respond(`${message.author}, você não tem uma empresa.`);
			
			if(!Object.values(ref.lojas).length) return message.respond(`${message.author}, você não tem nenhuma loja.`);
			
			const embed = new this.client.embed()
			.setAuthor(`${ref.name} - Lojas`, message.author.displayAvatarURL())
			.addField('Lista de lojas', Object.values(ref.lojas).map(l => `\`${l.nome}\` - Tipo: **${l.worker_name}**`).join("\n"))
			.setFooter(`${prefix}empresa lojainfo <nome da loja> para mais informações.`, message.author.displayAvatarURL());
			
			return message.channel.send(embed)
		}

    }
}
module.exports = Empresa
