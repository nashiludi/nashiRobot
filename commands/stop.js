const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Закончить концерт'),
    async execute(interaction){
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const { getVoiceConnection } = require('@discordjs/voice');
        const connection = getVoiceConnection(interaction.guild.id);
        if (songQueue[guildId].player.getCurrentState() == 'playing') {
            songQueue[guildId].player.stopPlayer(interaction);
            interaction.reply('Мур!');
            Logger.log('Stop: success.', interaction);
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
            Logger.log('Stop: discard.', interaction);
        }
        return true;
    }
}
