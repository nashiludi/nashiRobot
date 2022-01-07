const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Попросить Иванова изменить поведение!')
        .addStringOption(option =>
            option.setName('просьба')
                .setDescription('i - сменить способ ввода команд')
                .setRequired(true)),
	async execute(interaction, args = undefined) {
        const { client } = require(`${appDir}/vendor/client`);
        if (args) {
            var request = args[0];
            if (!request) {
                interaction.reply('Ваши забыли аргумент!');
                return true;
            }
        } else {
            var request = interaction.options.getString('просьба');
        }
        switch (request) {
            case 'i':
                client.server[interaction.guild.id].listener.emit('changeInputMethod');
                interaction.reply('Ваших понял!');
                break;
            default:
                interaction.reply('Ваших не понял!');
                break;
        }
	},
};
