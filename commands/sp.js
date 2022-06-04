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
	async execute(interaction, info) {
        interaction.reply('ИДИ К ЧЁРТУ! Я В ОТПУСКЕ! Хумер за главного!');
        return;
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
        if (client.queue[guildId].getQueue().length >= 999) {
            interaction.reply('Очередь переполнена!');
            Logger.log(`Play '${songName}': discard.`, interaction);
            return true;
        }
        interaction.reply(`\`\`\`Я услышал ваших!\`\`\``);
        var song = await GetInfo.spotifyJob(songName);
        if (song) {
            let interactionReplyText;
            if (song.type == 'track') {
                interactionReplyText = `\`\`\`Добавил в очередь: ${song.data.origTitle}\`\`\``;
                await client.queue[guildId].appendQueue(song.data);
            } else if (song.type == 'playlist' || song.type == 'album') {
                interactionReplyText = `\`\`\`Добавил в очередь: ${song.data[0].primaryTitle}\`\`\``;
                await client.queue[guildId].appendQueueWithArray(song.data);
            }
            setVoiceConnection(interaction);
            client.queue[guildId].player.playNewSong();
            Logger.log(`Play '${songName}': success.`, interaction);
            interaction.channel.send(interactionReplyText);
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