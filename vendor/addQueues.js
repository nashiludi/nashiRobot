const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const queuesSetup = require(`${appDir}/vendor/queuesSetup`);

module.exports = function addQueues(subject) {
    subject.queues = queuesSetup(subject);
}
