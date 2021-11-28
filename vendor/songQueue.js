const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { client } = require(`${appDir}/vendor/client`);
const queuesSetup = require(`${appDir}/vendor/queuesSetup`);

if (client) {
    var queues = queuesSetup(client);
} else {
    var queues = {};
}

module.exports = queues;