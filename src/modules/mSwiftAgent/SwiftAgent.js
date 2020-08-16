const { convertHourToMinutes } = require('../../utils/index')

module.exports = class SwiftAgent {
  constructor(client) {
    this.client = client;

    this.actions = []
  }

  async run() {
    this.client.instance.on('COMMAND_EXECUTED', (action) => {

      let response = 0;
      if (action[2].cmd.help.category === 'categories:devs') {
        response = 0
      } else {
        this.actions.map(a => {
          if (typeof response == 'string') response = 0;
  
          if (a.id === action[0].id && (a.cmd === action[2].cmd.help.name || action[2].cmd.conf.aliases.includes(a.cmd)) && (a.time + convertHourToMinutes('0:05') > action[2].time)) response += 1.0
          else {
            if (a.id === action[0].id && (a.cmd === action[2].cmd.help.name || action[2].cmd.conf.aliases.includes(a.cmd)) && (a.time + convertHourToMinutes('0:15') > action[2].time)) response += 0.1
          }
  
        })
      }

      this.actions.push({
        id: action[0].id,
        cmd: action[2].cmd.help.name,
        time: action[2].time
      })

      this.client.channels.cache.get(process.env.CONSOLE_COMMANDS).send(
        new this.client.embed()
          .setTitle('**<:console:689608798423351474> Comando Executado**')
          .setDescriptionFromBlockArray([
            [
              `O usuário \`${action[0].name}\` executou o comando \`${action[2].cmd.help.name}\` na guilda \`${action[1].name}\``
            ],
            [
              `\`\`\`ini\n [${action[2].uuid}] ~ [${response}%] \n\`\`\``
            ]
          ])
          .setColor('#2f3136')
      )
    })
  }
}