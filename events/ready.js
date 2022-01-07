const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const deployCommands = require(`${appDir}/deploy-commands`);
const Logger = require(`${appDir}/vendor/Logger`);
const { queuesSetup, serversSetup } = require(`${appDir}/vendor/setup`);

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        Logger.log(`Наши в космосе! Зашли по кличке ${client.user.tag}`);
        const guilds = client.guilds.cache.map(guild => guild.id);
        deployCommands(guilds);
        queuesSetup(client);
        serversSetup(client);
    },
};