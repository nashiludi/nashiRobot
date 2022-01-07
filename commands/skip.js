const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Пропустить музон'),
    async execute(interaction){
        const guildId = interaction.guild.id;
        const { client } = require(`${appDir}/vendor/client`);
        const { getVoiceConnection } = require('@discordjs/voice');
        const connection = getVoiceConnection(guildId);
        if (client.queue[guildId].player.getCurrentState() == 'playing') {
            client.queue[guildId].player.skipSong();
            interaction.reply('Мур!');
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
        return true;
    }
}
