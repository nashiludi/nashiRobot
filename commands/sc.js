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
	async execute(interaction, info) {
        const { client } = require(`${appDir}/vendor/client`);
        const guildId = interaction.guild.id;
        if (info.type == 'message') {
            if (!info.args) {
                interaction.reply('Ваши забыли аргумент!');
                return true;
            }
        }
        if (info.args) {
            var songName = info.args.join(' ');
            if (!songName) {
                interaction.reply('Ваши забыли аргумент!');
                return true;
            }
        } else {
            var songName = interaction.options.getString('трек');
        }
        let primaryType;
        let type;
        if (!info.args) {
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
        }
        if (client.queue[guildId].getQueue().length >= 999) {
            interaction.reply('Очередь переполнена!');
            Logger.log(`Play '${songName}': discard.`, interaction);
            return true;
        }
        interaction.reply(`\`\`\`Я услышал ваших!\`\`\``);
        var song = await GetInfo.getInfoSoundCloud(songName, type);
        if (song) {
            if (song.type == 'soundCloudTrack') {
                await client.queue[guildId].appendQueue(song.data);
            } else if (song.type == 'soundCloudPlaylist' || song.type == 'soundCloudAlbum') {
                await client.queue[guildId].appendQueueWithArray(song.data.tracks);
            }
            setVoiceConnection(interaction);
            client.queue[guildId].player.playNewSong();
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