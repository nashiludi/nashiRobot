require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

function deployCommands (guilds) {
	const commands = [];
	const commandFiles = fs.readdirSync(`${appDir}/commands`).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`${appDir}/commands/${file}`);
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: '9' }).setToken(token);
	let promise = Promise.resolve();
	const errors = [];
	let attempts = 0;
	let successes = 0;
	guilds.forEach(async guildId => {
		promise = promise.then(function () {
			console.log(`Попытка высадить команды на сервере: ${guildId}...`);
			attempts++;
			rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
				.then(() => {
					console.log('Успешно!');
					successes++;
				})
				.catch((error)=>{
					console.error(error);
					errors.push(guildId);
				});
			return new Promise(function (resolve) {
				setTimeout(resolve, 500);
			});
		});
	});
	promise.then(function () {
		if (errors.length == 0) {
			console.log(`Высадка на ${successes} из ${attempts} серверов успешна!`);
		} else {
			console.log(`Высадка провалилась на серверах: ${errors}`);
		}
	});
}

exports.deployCommands = deployCommands;