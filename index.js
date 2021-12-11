require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { client } = require(`${appDir}/vendor/client`);
const Logger = require(`${appDir}/vendor/Logger`);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		Logger.log(`Command executed: ${command.data.name}.`, interaction);
		await command.execute(interaction);
	} catch (error) {
		Logger.error(error, interaction);
		console.error(error);
		await interaction.reply({ content: 'Ошибка при выполнении команды!', ephemeral: true });
	}
});

client.login(token);

//TODO: (необязательно) Перейти на TS

//TODO: Добавить эмбеды
