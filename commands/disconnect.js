const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const playNewSong = require(`${appDir}/vendor/playNewSong`);

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
            console.log('disconnect!');
            if (songQueue[guildId].player.getCurrentState() == 'playing') {
                await playNewSong(interaction.guild.id, 'stop');
            }
            interaction.reply('Мур!');
            connection.destroy();
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
    }
}
