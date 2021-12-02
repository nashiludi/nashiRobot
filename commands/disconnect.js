const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const playNewSong = require(`${appDir}/vendor/playNewSong`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Покинуть голосовой канал'),
    async execute(interaction){
        const guildId = interaction.guild.id;
        const { getVoiceConnection } = require('@discordjs/voice');
        const connection = getVoiceConnection(guildId);
        if (connection) {
            const songQueue = require(`${appDir}/vendor/songQueue`);
            if (songQueue[guildId].player.getCurrentState() == 'playing') {
                await playNewSong(interaction, 'stop');
            }
            interaction.reply('Мур!');
            connection.destroy();
            Logger.log('Disconnect: success.', interaction);
            return true;
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
            Logger.log('Disconnect: discard.', interaction);
            return true;
        }
    }
}
