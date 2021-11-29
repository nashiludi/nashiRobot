const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const LinkChecker = require(`${appDir}/vendor/LinkChecker`);
const playNewSong = require(`${appDir}/vendor/playNewSong`);
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const getInfoYouTube = require(`${appDir}/vendor/getInfoYouTube`);

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
        console.log('play!');
        const guildId = interaction.guild.id;
        if (songQueue[guildId].getQueue().length >= 99) {
            await interaction.reply('Очередь переполнена!');
            return true;
        }
        const songName = interaction.options.getString('трек');
        var song = await getInfoYouTube(songName);
        if (song.length != 0) {
            await songQueue[guildId].appendQueue(song[0].url);
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
                        return false;
                    } else {
                    console.error(e)
                    return false;
                    }
                }
            }
            playNewSong(guildId);
            interaction.reply(`\`\`\`Начал проигрывание ${song[0].title}\`\`\``);
        } else {
            interaction.reply('Кошмаришь меня?!');
            return false;
        }
    }
}
