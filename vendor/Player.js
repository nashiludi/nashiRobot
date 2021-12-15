const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports = class Player {
    constructor(guildId){
        this.guildId = guildId;
    }
    currentState = 'idle';
    player = null;
    getCurrentState(){
        return this.currentState;
    }
    setIdleState(){
        this.currentState = 'idle';
        return true;
    }
    setPlayingState(){
        this.currentState = 'playing';
        return true;
    }
    setPlayer(player){
        this.player = player;
        return true;
    }
    getPlayer(){
        return this.player;
    }
    deletePlayer(){
        this.player = null;
        return true;
    }
    async playNewSong(interaction){
        const playdl = require('play-dl');
        const { getVoiceConnection, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
        const Logger = require(`${appDir}/vendor/Logger`);
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const song = songQueue[guildId].getQueueFirstElement();
        const url = song.url;
        const player = createAudioPlayer();
        player.on(AudioPlayerStatus.Playing, () => {
            this.setPlayingState();
        });
        player.on('error', () => {
            this.playNewSong(interaction, 'skip');
            this.skipSong(interaction);
        });
        Logger.log(`Playing a new song: ${song.title}.`, interaction);
        if (this.getCurrentState() == 'idle') {
            const connection = getVoiceConnection(guildId);
            try {
                var stream = await playdl.stream(url);
            } catch (e) {
                this.playNewSong(interaction, 'stop');
                interaction.channel.send('Ошибка! Иванов потерял паспорт и не может воспроизвести песню для взрослых и жителей других стран! Напомните ему завести новый!');
                Logger.error('PlayNewSong - ' + e);
                return false;
            }
            let resource = createAudioResource(stream.stream, {
                inputType : stream.type
            });
            stream = undefined;
            connection.subscribe(player);
            player.play(resource);
            this.setPlayer(player);
            player.on(AudioPlayerStatus.Idle, () => {
                this.setIdleState();
                if (songQueue[guildId].getQueue().length == 1) {
                    songQueue[guildId].shiftQueue();
                    return true;
                } else {
                    songQueue[guildId].shiftQueue();
                    this.playNewSong(interaction);
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
                    try {
                        connection.destroy();
                        this.setIdleState();
                        songQueue[guildId].clearQueue();
                        return true;
                    } catch (e) {
                        Logger.error(e);
                    }
                }
            });
        }
    }
    skipSong(interaction){
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        this.getPlayer().stop();
        if (songQueue[guildId].getQueue().length != 1) {
            this.playNewSong(interaction);
        }
        return true;
    }
    stopPlayer(interaction){
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        if (this.getPlayer() != null) {
            this.getPlayer().removeAllListeners();
            this.getPlayer().stop();
            this.deletePlayer();
            this.setIdleState();
        }
        songQueue[guildId].clearQueue();
        return true;
    }
}
