const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('хола')
		.setDescription('Приветствие для наших!'),
	async execute(interaction) {
		await interaction.reply('Хола бола!');
	},
};