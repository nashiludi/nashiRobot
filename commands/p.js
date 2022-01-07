const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const GetInfo = require(`${appDir}/vendor/GetInfo`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Сыграть песню')
        .addStringOption(option =>
            option.setName('трек')
                .setDescription('ссылка/название трека!')
                .setRequired(true)),
    async execute(interaction, args = undefined){
        const { client } = require(`${appDir}/vendor/client`);
        const guildId = interaction.guild.id;
        if (args) {
            var songName = args.join(' ');
            if (!songName) {
                interaction.reply('Ваши забыли аргумент!');
                return true;
            }
        } else {
            var songName = interaction.options.getString('трек');
        }
        if (client.queue[guildId].getQueue().length >= 999) {
            await interaction.reply('Очередь переполнена!');
            Logger.log(`Play '${songName}': discard.`, interaction);
            return true;
        }
        var song = await GetInfo.getInfoYouTube(songName);
        if (song.length != 0) {
            await client.queue[guildId].appendQueue(song[0]);
            setVoiceConnection(interaction);
            client.queue[guildId].player.playNewSong(interaction);
            Logger.log(`Play '${songName}': success.`, interaction);
            interaction.reply(`\`\`\`Добавил в очередь: ${song[0].title}\`\`\``);
            return true;
        } else {
            interaction.reply('Кошмаришь меня?!');
            Logger.log(`Play '${songName}': failure.`, interaction);
            return true;
        }
        function setVoiceConnection(interaction){
            if (!getVoiceConnection(interaction.guild.id)) {
                try {
                    var connection = joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                } catch (e) {
                    if (e instanceof TypeError) {
                        interaction.reply('А куда играть-то?!');
                        Logger.log('Play: failure.', interaction);
                        return false;
                    } else {
                        Logger.error(e, interaction)
                        return false;
                    }
                }
            }
        }

    }
}
