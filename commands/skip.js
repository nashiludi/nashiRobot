const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const playNewSong = require(`${appDir}/vendor/playNewSong`);

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
            playNewSong(interaction, 'skip');
            interaction.reply('Мур!');
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
    }
}
