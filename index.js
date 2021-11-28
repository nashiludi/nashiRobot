require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { client } = require(`${appDir}/vendor/client`);

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

//TODO: Добавить Logger

//TODO: Поиск по ютубу