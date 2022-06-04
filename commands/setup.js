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
	async execute(interaction, info) {
        const { client } = require(`${appDir}/vendor/client`);
        if (info.type == 'message') {
            if (!info.args) {
                interaction.reply('Ваши забыли аргумент!');
                return true;
            }
            var request = info.args[0];
        } else if (info.type == 'interaction') {
            var request = interaction.options.getString('просьба');
        } else {
            interaction.reply('???');
            return false;
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
