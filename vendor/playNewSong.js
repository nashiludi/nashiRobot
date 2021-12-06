const ytdl = require('ytdl-core');
const playdl = require('play-dl');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { getVoiceConnection, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const Logger = require(`${appDir}/vendor/Logger`);
const getInfoYouTube = require(`${appDir}/vendor/getInfoYouTube`);

module.exports = async function playNewSong (interaction, flag = null) {
    const guildId = interaction.guild.id;
    const songQueue = require(`${appDir}/vendor/songQueue`);
    const song = songQueue[guildId].getQueueFirstElement(); 
    const url = song.url;
    if (flag == 'skip') {
        if (songQueue[guildId].getQueue().length == 1) {
            songQueue[guildId].player.getPlayer().stop();
            return true;
        } else {
            songQueue[guildId].player.getPlayer().stop();
            playNewSong(interaction);
            return true;
        }
    }
    if (flag == 'stop') {
        if (songQueue[guildId].player.getPlayer() != null) {
            songQueue[guildId].player.getPlayer().removeAllListeners()
            songQueue[guildId].player.getPlayer().stop();
            songQueue[guildId].player.deletePlayer();
            songQueue[guildId].player.setIdleState();
        }
        songQueue[guildId].clearQueue();
        return true;
    }
    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Playing, () => {
        songQueue[guildId].player.setPlayingState();
    });
    player.on('error', () => {
        playNewSong(interaction, 'skip');
    });
    Logger.log(`Playing a new song: ${song.title}.`, interaction);
    if (songQueue[guildId].player.getCurrentState() == 'idle') {
        const connection = getVoiceConnection(guildId);
        try {
            var stream = await playdl.stream(url);
        } catch (e) {
            playNewSong(interaction, 'stop');
            interaction.channel.send('Ошибка! Иванов потерял паспорт и не может воспроизвести видео для взрослых и жителей других стран! Напомните ему завести новый!');
            Logger.error('PlayNewSong - ' + e);
            return false;
        }
        let resource = createAudioResource(stream.stream, {
            inputType : stream.type
        })
        stream = undefined;
        connection.subscribe(player);
        player.play(resource);
        songQueue[guildId].player.setPlayer(player);
        player.on(AudioPlayerStatus.Idle, () => {
            songQueue[guildId].player.setIdleState();
            if (songQueue[guildId].getQueue().length == 1) {
                songQueue[guildId].shiftQueue();
                return true;
            } else {
                songQueue[guildId].shiftQueue();
                playNewSong(interaction);
                return true;
            }
        });
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                connection.destroy();
                songQueue[guildId].player.setIdleState();
                songQueue[guildId].clearQueue();
                return true;
            }
        });
    }
}
