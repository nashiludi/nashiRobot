const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Пропустить музон'),
    async execute(interaction){
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const { getVoiceConnection } = require('@discordjs/voice');
        const connection = getVoiceConnection(guildId);
        if (songQueue[guildId].player.getCurrentState() == 'playing') {
            songQueue[guildId].player.skipSong(interaction);
            interaction.reply('Мур!');
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
        return true;
    }
}
