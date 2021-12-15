const { dirname } = require('path');
const appDir = dirname(require.main.filename);
require('dotenv').config({path: `${appDir}\\.env`});
const prod = process.env.APP_PROD;
const fs = require('fs');

module.exports = class Logger {
    static _getPrefix(interaction = null) {
        const currentDate = new Date();
        let hour = ("0" + currentDate.getHours()).slice(-2);
        let min = ("0" + currentDate.getMinutes()).slice(-2);
        let sec = ("0" + currentDate.getSeconds()).slice(-2);
        return interaction === null ?
            `[${hour}:${min}:${sec}]` :
            `[${hour}:${min}:${sec}] '${interaction.guild.name}', ${interaction.user.username}:`;
    }

    static _LogInfo(info, interaction = null) {
        return `${Logger._getPrefix(interaction)} ${info}`;
    }

    static _LogError(error, interaction = null) {
        return `${Logger._getPrefix(interaction)} ERROR: ${error}`;
    }

    static consoleLog(info, interaction = null) {
        if (prod !== 'TRUE') {
            console.log(Logger._LogInfo(info, interaction));
            return true;
        }
        return false;
    }

    static consoleError(error, interaction = null) {
        console.error(Logger._LogError(error, interaction));
        return true;
    }

    static async fileLog(info, interaction = null) {
        if ((prod !== 'TRUE') && fs.existsSync(`${appDir}\\logs`)) {
            const currentDate = new Date();
            let date = ("0" + currentDate.getDate()).slice(-2);
            let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
            let year = currentDate.getFullYear();
            await fs.appendFile(`${appDir}\\logs\\${date}-${month}-${year}.txt`, `${Logger._LogInfo(info, interaction)}\n`, (e)=>{if (e) {return e;}});
            return true;
        }
        return false;
    }

    static async fileError(error, interaction = null) {
        if (fs.existsSync(`${appDir}\\logs`)) {
            const currentDate = new Date();
            let date = ("0" + currentDate.getDate()).slice(-2);
            let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
            let year = currentDate.getFullYear();
            await fs.appendFile(`${appDir}\\logs\\${date}-${month}-${year}.txt`, `${Logger._LogError(error, interaction)}\n`, (e)=>{if (e) {return e;}});
            return true;
        }
        return false;
    }

    static log(info, interaction = null) {
        if (prod !== 'TRUE') {
            Logger.consoleLog(info, interaction);
            Logger.fileLog(info, interaction);
            return true;
        }
        return false;
    }

    static error(error, interaction = null) {
        Logger.consoleError(error, interaction);
        Logger.fileError(error, interaction);
        return true;
    }
}
