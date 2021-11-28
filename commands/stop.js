const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const playNewSong = require(`${appDir}/vendor/playNewSong`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Закончить концерт'),
    async execute(interaction){
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        console.log('stop!');
        const { getVoiceConnection } = require('@discordjs/voice');
        const connection = getVoiceConnection(interaction.guild.id);
        if (songQueue[guildId].player.getCurrentState() == 'playing') {
            playNewSong(interaction.guild.id, 'stop');
            interaction.reply('Мур!');
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
    }
}
