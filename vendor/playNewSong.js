const ytdl = require('ytdl-core');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const { getVoiceConnection, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = async function playNewSong (guildId, flag = null) {
    const songQueue = require(`${appDir}/vendor/songQueue`);
    const url = songQueue[guildId].getQueueFirstElement();
    if (flag == 'skip') {
        if (songQueue[guildId].getQueue().length == 1) {
            songQueue[guildId].player.getPlayer().stop();
            return;
        } else {
            songQueue[guildId].player.getPlayer().stop();
            playNewSong(guildId);
            return;
        }
    }
    if (flag == 'stop') {
        songQueue[guildId].player.getPlayer().removeAllListeners()
        songQueue[guildId].player.getPlayer().stop();
        songQueue[guildId].clearQueue();
        songQueue[guildId].player.deletePlayer();
        songQueue[guildId].player.setIdleState();
        return;
    }
    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Playing, () => {
        songQueue[guildId].player.setPlayingState();
    });
    player.on('error', () => {
        playNewSong(guildId, 'skip');
    });
    console.log('playnewsong!');
    if (songQueue[guildId].player.getCurrentState() == 'idle') {
        const connection = getVoiceConnection(guildId);
        var stream = ytdl(url, {filter: 'audioonly'});
        const resource = createAudioResource(stream);
        stream = undefined;
        connection.subscribe(player);
        player.play(resource);
        songQueue[guildId].player.setPlayer(player);
    player.on(AudioPlayerStatus.Idle, () => {
        songQueue[guildId].player.setIdleState();
        if (songQueue[guildId].getQueue().length == 1) {
            songQueue[guildId].shiftQueue();
            return;
        } else {
            songQueue[guildId].shiftQueue();
            playNewSong(guildId);
            return;
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
            return;
        }
    });
    }
}
