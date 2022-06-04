const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('changeprefix')
        .setDescription('Изменить префикс для команд сообщениями')
        .addStringOption(option =>
            option.setName('префикс')
                .setDescription('один из: ! $ % ^ & * \\')
                .setRequired(true)),
    async execute(interaction, info){
        const guildId = interaction.guild.id;
        const { client } = require(`${appDir}/vendor/client`);
        if (info.type == 'message') {
            if (!info.args) {
                interaction.reply('Ваши забыли аргумент!');
                return true;
            }
            var prefix = info.args[0];
        } else if (info.type == 'interaction') {
            var prefix = interaction.options.getString('префикс');
        } else {
            interaction.reply(`???`);
            return false;
        }
        prefix = prefix.slice(0, 100);
        if(client.server[guildId].setPrefix(prefix)) {
            interaction.reply(`Префикс изменён на ${prefix}`);
        } else {
            interaction.reply(`Префикс ${prefix} установить нельзя`);
        }
    }
}
