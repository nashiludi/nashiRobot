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
        const { client } = require(`${appDir}/vendor/client`);
        const { getVoiceConnection } = require('@discordjs/voice');
        const connection = getVoiceConnection(interaction.guild.id);
        if (client.queue[guildId].player.getCurrentState() == 'playing') {
            client.queue[guildId].player.stopPlayer();
            interaction.reply('Мур!');
            Logger.log('Stop: success.', interaction);
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
            Logger.log('Stop: discard.', interaction);
        }
        return true;
    }
}
