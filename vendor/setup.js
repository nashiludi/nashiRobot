const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Queue = require(`${appDir}/vendor/Queue`);
const Server = require(`${appDir}/vendor/Server`);

function queuesSetup (subject) {
    const guilds = subject.guilds.cache.map(guild => guild.id);
    const queue = {};
    guilds.forEach(element => {
        queue[element] = new Queue(element);
    });
    subject.queue = queue;
}

function serversSetup (subject) {
    const guilds = subject.guilds.cache.map(guild => guild.id);
    const server = {};
    guilds.forEach(element => {
        server[element] = new Server(element);
        server[element].listener.on('changeInputMethod', ()=>{
            server[element].changeCommandInputMethod();
        });
    });
    subject.server = server;
}

exports.queuesSetup = queuesSetup;
exports.serversSetup = serversSetup;
