const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports = class Player {
    constructor(guildId){
        this.guildId = guildId;
    }
    currentVoiceChannelId = null;
    autoDisconnectInterval = null;
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
    getCurrentVoiceChannelId(){
        return this.currentVoiceChannelId;
    }
    setCurrentVoiceChannelId(voiceChannelId){
        this.currentVoiceChannelId = voiceChannelId;
        clearInterval(this.autoDisconnectInterval);
        this.autoDisconnectInterval = setInterval(this.shouldDisconnect.bind(this), 1000 * 60 * 10);
        return true;
    }
    clearCurrentVoiceChannelId(){
        this.currentVoiceChannelId = null;
        clearInterval(this.autoDisconnectInterval);
        this.autoDisconnectInterval = null;
        return true;
    }
    shouldDisconnect(){
        const Logger = require(`${appDir}/vendor/Logger`);
        let shouldDisconnect = true;
        const { client } = require(`${appDir}/vendor/client`);
        client.guilds.fetch(this.guildId).then(response=>{
            const voiceChannel = response.channels.cache.get(this.currentVoiceChannelId);
            voiceChannel.members.forEach(member=>{
                if (member.user.bot == false) {
                    shouldDisconnect = false;
                }
            });
            if (shouldDisconnect) {
                const { getVoiceConnection } = require('@discordjs/voice');
                const connection = getVoiceConnection(this.guildId);
                if (connection) {
                    if (client.queue[this.guildId].player.getCurrentState() == 'playing') {
                        client.queue[this.guildId].player.stopPlayer();
                    }
                    connection.destroy();
                    client.queue[this.guildId].player.clearCurrentVoiceChannelId();
                    Logger.log(`Autodisconnect. Guild: ${this.guildId}.`,);
                }
            }
            return true;
        });
    }
    async playNewSong(){
        const playdl = require('play-dl');
        const { getVoiceConnection, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
        const Logger = require(`${appDir}/vendor/Logger`);
        const { client } = require(`${appDir}/vendor/client`);
        const song = client.queue[this.guildId].getQueueFirstElement();
        const url = song.url;
        const player = createAudioPlayer();
        player.on(AudioPlayerStatus.Playing, () => {
            this.setPlayingState();
        });
        player.on('error', () => {
            this.skipSong();
        });
        Logger.log(`Playing a new song: ${song.name ?? song.title}. Guild: ${this.guildId}.`);
        if (this.getCurrentState() == 'idle') {
            const connection = getVoiceConnection(this.guildId);
            try {
                var stream = await playdl.stream(url);
            } catch (e) {
                console.error(e);
                this.stopPlayer();
                // interaction.channel.send('Ошибка! Иванов потерял паспорт и не может воспроизвести песню для взрослых и жителей других стран! Напомните ему завести новый!');
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
                if (client.queue[this.guildId].getQueue().length == 1) {
                    client.queue[this.guildId].shiftQueue();
                    return true;
                } else {
                    client.queue[this.guildId].shiftQueue();
                    this.playNewSong();
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
                        client.queue[this.guildId].player.clearCurrentVoiceChannelId();
                        this.setIdleState();
                        client.queue[this.guildId].clearQueue();
                        return true;
                    } catch (e) {
                        Logger.error(e);
                    }
                }
            });
        }
    }
    skipSong(){
        const { client } = require(`${appDir}/vendor/client`);
        this.getPlayer().stop();
        if (client.queue[this.guildId].getQueue().length != 1) {
            this.playNewSong();
        }
        return true;
    }
    stopPlayer(){
        const { client } = require(`${appDir}/vendor/client`);
        if (this.getPlayer() != null) {
            this.getPlayer().removeAllListeners();
            this.getPlayer().stop();
            this.deletePlayer();
            this.setIdleState();
        }
        client.queue[this.guildId].clearQueue();
        return true;
    }
}
