const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { deployCommands } = require(`${appDir}/deploy-commands`);

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Наши в космосе! Зашли по кличке ${client.user.tag}`);
        const guilds = client.guilds.cache.map(guild => guild.id);
        deployCommands(guilds);
    },
};