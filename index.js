require('dotenv').config();
const fs = require('fs');
const token = process.env.DISCORD_TOKEN;
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { client } = require(`${appDir}/vendor/client`);
// const songQueue = require(`${appDir}/vendor/songQueue`);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Ошибка при выполнении команды!', ephemeral: true });
	}
});

client.login(token);

//TODO: (необязательно) Добавить классам ожидаемые значения

//TODO: Добавить очистку эвент эммитеров от лисенеров