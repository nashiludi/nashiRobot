require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { client } = require(`${appDir}/vendor/client`);
const Logger = require(`${appDir}/vendor/Logger`);

client.on('interactionCreate', async interaction => {
	if (client.server[interaction.guild.id].getCommandInputMethod() == 'slashCommand') {
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
	} else {
		await interaction.reply(`Я работаю в режиме прослушки сообщений! Для смены режима введите ${client.server[interaction.guild.id].getPrefix()}setup i`);
	}
});

client.on("messageCreate", async message => {
	if (message.author.id == clientId || message.author.bot == true) return;
	if (client.server[message.guild.id]?.getCommandInputMethod() == 'messageCommand') {
		const prefix = client.server[message.guildId].getPrefix();
		if (message.content.startsWith(prefix)) {
			let infoFromMessage = message.content.substr(1).trim().match(/([^ ]+)/gui);
			let args = [];
			if (infoFromMessage.length != 1) infoFromMessage.forEach((element, i) => {
				if (i!=0) args.push(element);
			});
			const command = client.commands.get(infoFromMessage[0].toLowerCase());
			if (!command) return;
			try {
				Logger.log(`Command executed: ${command.data.name}.`);
				if (args[0]) await command.execute(message, args);
				else await command.execute(message);
			} catch (error) {
				Logger.error(error, message);
				console.error(error);
				await message.reply({ content: 'Ошибка при выполнении команды!', ephemeral: true });
			}
		}
	}
});

client.login(token);

//TODO: (необязательно) Перейти на TS

//TODO: Добавить эмбеды

//TODO: Передавать объект вместо interaction и args