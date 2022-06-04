require('dotenv').config();
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Queue = require(`${appDir}/vendor/Queue`);
const Server = require(`${appDir}/vendor/Server`);
const DBClient = require(`${appDir}/vendor/DBClient`);

function queuesSetup (subject) {
    const guilds = subject.guilds.cache.map(guild => guild.id);
    const queue = {};
    guilds.forEach(element => {
        queue[element] = new Queue(element);
    });
    subject.queue = queue;
}

async function serversSetup (subject) {
    const guilds = subject.guilds.cache.map(guild => guild.id);
    const server = {};
    const guildsFromDB = await getGuildsFromDB();
    const guildIdsInDB = [];
    const guildIdsNotInDB = [];
    for (const element of guildsFromDB) {
        guildIdsInDB.push(element._id);
    }
    for (const element of guilds) {
        server[element] = new Server(element);
        if (!guildIdsInDB.includes(element)) {
            guildIdsNotInDB.push(element);
        }
    }
    if (guildIdsNotInDB[0]) {
        await insertGuildsIntoDB(guildIdsNotInDB);
    }
    for (const element of guilds) {
        await server[element].setPrefixFromDB();
        await server[element].setCommandInputMethodFromDB();
        server[element].listener.on('changeInputMethod', async ()=>{
            await server[element].changeCommandInputMethod();
        });
    }
    subject.server = server;
}

async function getGuildsFromDB () {
    await DBClient.connect();
    const db = DBClient.db(process.env.DB_NAME);
    const collection = db.collection('guilds');
    const guilds = await collection.find({}).toArray();
    await DBClient.close();
    return guilds;
}

async function insertGuildsIntoDB (guildIds) {
    let query = [];
    guildIds.forEach(e=>{
        query.push({_id: e, settings: {inputMethod: 'slashCommand', prefix: '!'}});
    });
    await DBClient.connect();
    const db = DBClient.db(process.env.DB_NAME);
    const collection = db.collection('guilds');
    await collection.insertMany(query);
    await DBClient.close();
    return true;
}

exports.queuesSetup = queuesSetup;
exports.serversSetup = serversSetup;
