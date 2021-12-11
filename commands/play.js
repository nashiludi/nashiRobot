const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const LinkChecker = require(`${appDir}/vendor/LinkChecker`);
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const getInfoYouTube = require(`${appDir}/vendor/getInfoYouTube`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Сыграть песню')
        .addStringOption(option =>
            option.setName('трек')
                .setDescription('ссылка/название трека!')
                .setRequired(true)),
    async execute(interaction){
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const guildId = interaction.guild.id;
        const songName = interaction.options.getString('трек');
        if (songQueue[guildId].getQueue().length >= 99) {
            await interaction.reply('Очередь переполнена!');
            Logger.log(`Play '${songName}': discard.`, interaction);
            return true;
        }
        var song = await getInfoYouTube(songName);
        if (song.length != 0) {
            await songQueue[guildId].appendQueue(song[0]);
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
            songQueue[guildId].player.playNewSong(interaction);
            Logger.log(`Play '${songName}': success.`, interaction);
            interaction.reply(`\`\`\`Добавил в очередь: ${song[0].title}\`\`\``);
        } else {
            interaction.reply('Кошмаришь меня?!');
            Logger.log(`Play '${songName}': failure.`, interaction);
            return true;
        }
    }
}
