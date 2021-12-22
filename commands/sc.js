const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const GetInfo = require(`${appDir}/vendor/GetInfo`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports = {
	data: new SlashCommandBuilder()
        .setName('sc')
        .setDescription('Сыграть песню из SoundCloud (вызывает ЛАГИ)')
        .addStringOption(option =>
            option.setName('трек')
                .setDescription('ссылка/название трека!')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('тип')
                .setDescription('track (t) / playlist (p) / album (a)')
                .setRequired(false)),
	async execute(interaction) {
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const guildId = interaction.guild.id;
        const songName = interaction.options.getString('трек');
        let primaryType;
        let type;
        if (interaction.options.getString('тип')) {
            primaryType = interaction.options.getString('тип').slice(0, 1) == 't' ||
                interaction.options.getString('тип').slice(0, 1) == 'p' ||
                interaction.options.getString('тип').slice(0, 1) == 'a' ?
                interaction.options.getString('тип').slice(0, 1) : false;
            if (primaryType == 't') {
                type = 'track';
            } else if (primaryType == 'p') {
                type = 'playlist';
            } else if (primaryType == 'a') {
                type = 'album';
            }
        }
        if (songQueue[guildId].getQueue().length >= 999) {
            interaction.reply('Очередь переполнена!');
            Logger.log(`Play '${songName}': discard.`, interaction);
            return true;
        }
        interaction.reply(`\`\`\`Я услышал ваших!\`\`\``);
        var song = await GetInfo.getInfoSoundCloud(songName, type);
        if (song) {
            if (song.type == 'soundCloudTrack') {
                await songQueue[guildId].appendQueue(song.data);
            } else if (song.type == 'soundCloudPlaylist' || song.type == 'soundCloudAlbum') {
                await songQueue[guildId].appendQueueWithArray(song.data.tracks);
            }
            setVoiceConnection(interaction);
            songQueue[guildId].player.playNewSong(interaction);
            Logger.log(`Play '${songName}': success.`, interaction);
            interaction.channel.send(`\`\`\`Добавил в очередь ${song.data.name}!\`\`\``);
            return true;
        } else {
            interaction.channel.send('Кошмаришь меня?!');
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
                        interaction.channel.send('А куда играть-то?!');
                        Logger.log('Play: failure.', interaction);
                        return false;
                    } else {
                        Logger.error(e, interaction)
                        return false;
                    }
                }
            }
        }
	},
};