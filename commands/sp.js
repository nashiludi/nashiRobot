const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const GetInfo = require(`${appDir}/vendor/GetInfo`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports = {
	data: new SlashCommandBuilder()
        .setName('sp')
        .setDescription('Сыграть песню из Spotify')
        .addStringOption(option =>
            option.setName('трек')
                .setDescription('ссылка/название трека!')
                .setRequired(true)),
	async execute(interaction) {
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const guildId = interaction.guild.id;
        const songName = interaction.options.getString('трек');
        if (songQueue[guildId].getQueue().length >= 999) {
            await interaction.reply('Очередь переполнена!');
            Logger.log(`Play '${songName}': discard.`, interaction);
            return true;
        }
        var song = await GetInfo.spotifyJob(songName);
        if (song) {
            let interactionReplyText;
            if (song.type == 'track') {
                interactionReplyText = `\`\`\`Добавил в очередь: ${song.data.origTitle}\`\`\``;
                await songQueue[guildId].appendQueue(song.data);
            } else if (song.type == 'playlist' || song.type == 'album') {
                interactionReplyText = `\`\`\`Добавил в очередь: ${song.data[0].primaryTitle}\`\`\``;
                await songQueue[guildId].appendQueueWithArray(song.data);
            }
            setVoiceConnection(interaction);
            songQueue[guildId].player.playNewSong(interaction);
            Logger.log(`Play '${songName}': success.`, interaction);
            interaction.reply(interactionReplyText);
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
	},
};