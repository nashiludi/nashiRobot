var events = require('events');
require('dotenv').config();
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const DBClient = require(`${appDir}/vendor/DBClient`);

module.exports = class Server {

    constructor(guildId) {
        this.guildId = guildId;
    }

    commandInputMethod = 'slashCommand';

    listener = new events.EventEmitter();

    prefix = '!';

    getPrefix () {
        return this.prefix;
    }

    async setPrefixFromDB () {
        await DBClient.connect();
        const db = DBClient.db(process.env.DB_NAME);
        const collection = db.collection('guilds');
        const guild = await collection.findOne({ _id: this.guildId }, { _id: 0, 'settings.prefix': 1 });
        this.prefix = guild.settings.prefix;
        await DBClient.close();
        return true;
    }

    async setPrefix (prefix) {
        if (!this.validatePrefix(prefix)) return false;
        this.prefix = prefix;
        await this.changePrefixInDB(prefix);
        return true;
    }

    async changePrefixInDB (prefix) {
        await DBClient.connect();
        const db = DBClient.db(process.env.DB_NAME);
        const collection = db.collection('guilds');
        await collection.updateOne({ _id: this.guildId }, { $set: { 'settings.prefix': prefix } });
        await DBClient.close();
        return true;
    }

    validatePrefix (prefix) {
        const allowedPrefixes = ['!', '$', '%', '^', '&', '*', '\\'];
        if (allowedPrefixes.includes(prefix)) {
            return true;
        } else {
            return false;
        }
    }

    getCommandInputMethod () {
        return this.commandInputMethod;
    }

    setCommandInputMethod (method) {
        this.commandInputMethod = method;
        return true;
    }

    async setCommandInputMethodFromDB () {
        await DBClient.connect();
        const db = DBClient.db(process.env.DB_NAME);
        const collection = db.collection('guilds');
        const guild = await collection.findOne({ _id: this.guildId }, { _id: 0, 'settings.inputMethod': 1 });
        this.commandInputMethod = guild.settings.inputMethod;
        await DBClient.close();
        return true;
    }

    async changeCommandInputMethod () {
        if (this.getCommandInputMethod() == 'slashCommand') {
            this.setCommandInputMethod('messageCommand');
            await this.changeCommandInputMethodInDB('messageCommand');
        } else if (this.getCommandInputMethod() == 'messageCommand') {
            this.setCommandInputMethod('slashCommand');
            await this.changeCommandInputMethodInDB('slashCommand');
        }
        return true;
    }

    async changeCommandInputMethodInDB (inputMethod) {
        await DBClient.connect();
        const db = DBClient.db(process.env.DB_NAME);
        const collection = db.collection('guilds');
        await collection.updateOne({ _id: this.guildId }, { $set: { 'settings.inputMethod': inputMethod } });
        await DBClient.close();
        return true;
    }
}