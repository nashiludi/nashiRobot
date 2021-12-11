const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Queue = require(`${appDir}/vendor/Queue`);

module.exports = function queuesSetup (client) {
    const guilds = client.guilds.cache.map(guild => guild.id);
    const queues = {};
    guilds.forEach(element => {
        queues[element] = new Queue(element);
    });
    return queues;
}
