const fs = require('fs');
const { Collection } = require('discord.js');

function addCommands (subject) {
    subject.commands = new Collection();
    const commandFiles = fs.readdirSync(`${appDir}/commands`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`${appDir}/commands/${file}`);
        subject.commands.set(command.data.name, command);
    }
}

exports.addCommands = addCommands;