const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const ytdl = require('ytdl-core');
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('getinfo')
        .setDescription('Получить информацию о тречке из очереди')
        .addIntegerOption(option =>
            option.setName('номер')
                .setDescription('номер тречка в очереди!')
                .setRequired(false)),
    async execute(interaction){
        const guildId = interaction.guild.id;
        const songQueue = require(`${appDir}/vendor/songQueue`);
        const queueNumber = interaction.options.getInteger('номер')-1;
        if (songQueue[guildId].player.getCurrentState() == 'playing') {
            if (songQueue[guildId].getQueue()[queueNumber]) {
                var requestedSong = songQueue[guildId].getQueue()[queueNumber];
            } else {
                var requestedSong = songQueue[guildId].getQueueFirstElement();
            }
            function getFormattedTime(length1, length2) {
                function secsToTime(length) {
                    const hours = Math.floor(length / 3600);
                    const mins = Math.floor(length / 60) - (hours * 60);
                    const secs = length - (hours * 3600) - (mins * 60);
                    return [hours, mins, secs];
                }
                function getFormattedNum(num) {
                    return num < 10 ? `0${num}` : `${num}`;
                }
                const secsToTimeResult1 = secsToTime(length1);
                const secsToTimeResult2 = secsToTime(length2);
                if (secsToTimeResult2[0] == 0) {
                    return `${getFormattedNum(secsToTimeResult1[1])}:${getFormattedNum(secsToTimeResult1[2])}/${getFormattedNum(secsToTimeResult2[1])}:${getFormattedNum(secsToTimeResult2[2])}`;
                } else if (secsToTimeResult2[0] < 10) {
                    return `${getFormattedNum(secsToTimeResult1[0])}:${getFormattedNum(secsToTimeResult1[1])}:${getFormattedNum(secsToTimeResult1[2])}/${getFormattedNum(secsToTimeResult2[0])}:${getFormattedNum(secsToTimeResult2[1])}:${getFormattedNum(secsToTimeResult2[2])}`;
                }
            }
            var output =
                `<https://youtu.be/${requestedSong.id}>\n` +
                '```' + `Название: ${requestedSong.title}\n` +
                `Длительность: ${getFormattedTime(Math.floor(songQueue[guildId].player.getPlayer()._state.playbackDuration / 1000), requestedSong.durationInSec)}\n` +
                `Автор: ${requestedSong.channel.name}\n` +
                `Просмотров: ${requestedSong.views}\n` +
                `Описание:\n`;
            if (requestedSong.description.length > 0) {
                output = output.concat(`${requestedSong.description.length <= 1000 ? requestedSong.description : requestedSong.description.substring(0, 1000).concat('...')}\n`);
            }
            output = output.concat('```');
            output = output.replace(/discord[.](gg|io|me|li|com|net|new|gift|gifts|media)[\/]/gmiu, (match)=>{
                return match.replace(/(gg|io|me|li|com|net|new|gift|gifts|media)/gmiu, 'nashi');
            });
            interaction.reply(output);
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
    }
}
