client.on('ready', () => {

  client.initLoaders();

  const { SwiftGiveaways } = require('./src/services/index.js');

  // Starts updating currents giveaways
  client.controllers.sorteios = new SwiftGiveaways(client, {
    storage: false,
    updateCountdownEvery: 10000,
    default: {
      botsCanWin: false,
      exemptPermissions: ["MANAGE_MESSAGES", "ADMINISTRATOR"],
      reaction: "🎉",
      embedColor: "#D90000",
      embedColorEnd: "#D90000"
    }
  });
})
