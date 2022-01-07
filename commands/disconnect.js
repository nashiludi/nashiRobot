const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
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
            const { client } = require(`${appDir}/vendor/client`);
            if (client.queue[guildId].player.getCurrentState() == 'playing') {
                client.queue[guildId].player.stopPlayer();
            }
            interaction.reply('Мур!');
            connection.destroy();
            client.queue[guildId].player.clearCurrentVoiceChannelId();
            Logger.log('Disconnect: success.', interaction);
            return true;
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
            Logger.log('Disconnect: discard.', interaction);
            return true;
        }
    }
}
