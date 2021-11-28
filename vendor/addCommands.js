const fs = require('fs');
const { Collection } = require('discord.js');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

function addCommands (subject) {
    subject.commands = new Collection();
    const commandFiles = fs.readdirSync(`${appDir}/commands`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${appDir}/commands/${file}`);
        subject.commands.set(command.data.name, command);
    }
}

exports.addCommands = addCommands;