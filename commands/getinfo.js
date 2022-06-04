const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('getinfo')
        .setDescription('Получить информацию о тречке из очереди')
        .addIntegerOption(option =>
            option.setName('номер')
                .setDescription('номер тречка в очереди!')
                .setRequired(false)),
    async execute(interaction, info){
        const guildId = interaction.guild.id;
        const { client } = require(`${appDir}/vendor/client`);
        if (info.type == 'message' && info.args && info.args[0]) {
            var queueNumber = info.args[0]-1;
        } else if (info.type == 'interaction') {
            var queueNumber = interaction.options.getInteger('номер')-1;
        }
        let shouldShowDuration = false;
        if (client.queue[guildId].player.getCurrentState() == 'playing') {
            if (client.queue[guildId].getQueue()[queueNumber]) {
                var requestedSong = client.queue[guildId].getQueue()[queueNumber];
                if (queueNumber == 0) shouldShowDuration = true;
            } else {
                var requestedSong = client.queue[guildId].getQueueFirstElement();
                shouldShowDuration = true;
            }
            function getFormattedTime(length1, length2, shouldShowDuration) {
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
                if (shouldShowDuration) {
                    if (secsToTimeResult2[0] == 0) {
                        return `${getFormattedNum(secsToTimeResult1[1])}:${getFormattedNum(secsToTimeResult1[2])}/${getFormattedNum(secsToTimeResult2[1])}:${getFormattedNum(secsToTimeResult2[2])}`;
                    } else if (secsToTimeResult2[0] < 10) {
                        return `${getFormattedNum(secsToTimeResult1[0])}:${getFormattedNum(secsToTimeResult1[1])}:${getFormattedNum(secsToTimeResult1[2])}/${getFormattedNum(secsToTimeResult2[0])}:${getFormattedNum(secsToTimeResult2[1])}:${getFormattedNum(secsToTimeResult2[2])}`;
                    }
                } else {
                    if (secsToTimeResult2[0] == 0) {
                        return `${getFormattedNum(secsToTimeResult2[1])}:${getFormattedNum(secsToTimeResult2[2])}`;
                    } else if (secsToTimeResult2[0] < 10) {
                        return `${getFormattedNum(secsToTimeResult2[0])}:${getFormattedNum(secsToTimeResult2[1])}:${getFormattedNum(secsToTimeResult2[2])}`;
                    }
                }
            }
            function getViewsFormatted (views) {
                views = views + '';
                if (views.length <= 3) return views;
                let output = views.slice(0, (views.length % 3)) + ' ';
                if (output.length == 1) output = '';
                for(let i = output.length-1 > 0 ? output.length-1 : 0;i<views.length;i+=3){
                    output = output.concat(views.slice(i, i+3)) + ' ';
                }
                output = output.slice(0, output.length-1);
                return output;
            }
            if (requestedSong.primaryType) {
                var output =
                    `<${requestedSong.origUrl}}>\n` +
                    `${requestedSong.primaryType == 'track' ? '' : '<' + requestedSong.primaryUrl + '>\n'}` +
                    `<https://youtu.be/${requestedSong.id}>\n` +
                    '```' + `Название: ${requestedSong.origTitle}\n` +
                    `${requestedSong.primaryType == 'track' ? '' : (requestedSong.primaryType == 'album' ? 'Альбом: ' : 'Плейлист: ') + requestedSong.primaryTitle + '\n'}` +
                    `Длительность: ${getFormattedTime(Math.floor(client.queue[guildId].player.getPlayer()._state.playbackDuration / 1000), requestedSong.durationInSec, shouldShowDuration)}\n` +
                    `${requestedSong.origArtist ? 'Исполнитель: ' + requestedSong.origArtist + '\n' : ''}`;
                    if (requestedSong.primaryType) output = output.concat(`${requestedSong.primaryType == 'track' ? '' : 'Автор: ' + requestedSong.primaryArtist + '\n'}`);
            } else if (requestedSong.name) {
                var output =
                    (requestedSong.origArtistUrl ? `<${requestedSong.origArtistUrl}>\n` : '') +
                    (requestedSong.user.url ? `<${requestedSong.user.url}>\n` : '') +
                    '```' + `Название: ${requestedSong.name}\n` +
                    `${requestedSong.primaryTypeSC == 'track' ? '' : (requestedSong.primaryTypeSC == 'album' ? 'Альбом: ' : 'Плейлист: ') + requestedSong.origTitleSC + '\n'}` +
                    `Длительность: ${getFormattedTime(Math.floor(client.queue[guildId].player.getPlayer()._state.playbackDuration / 1000), requestedSong.durationInSec, shouldShowDuration)}\n` +
                    (requestedSong.user.name ? `Исполнитель: ${requestedSong.user.name}\n` : '') +
                    (requestedSong.origArtist ? `Автор: ${requestedSong.origArtist}\n` : '');
            } else {
                var output =
                    `<https://youtu.be/${requestedSong.id}>\n` +
                    '```' + `Название: ${requestedSong.title}\n` +
                    `Длительность: ${getFormattedTime(Math.floor(client.queue[guildId].player.getPlayer()._state.playbackDuration / 1000), requestedSong.durationInSec, shouldShowDuration)}\n` +
                    `Автор: ${requestedSong.channel.name}\n` +
                    `Просмотров: ${getViewsFormatted(requestedSong.views)}\n`;
                if (requestedSong.description?.length > 0) {
                    output = output.concat(`Описание: ${requestedSong.description.length <= 1000 ? requestedSong.description : requestedSong.description.substring(0, 1000).concat('...')}\n`);
                }
            }
            output = output.concat('```');
            output = output.replace(/discord[.](gg|io|me|li|com|net|new|gift|gifts|media)[\/]/gmiu, (match)=>{
                return match.replace(/(gg|io|me|li|com|net|new|gift|gifts|media)/gmiu, 'nashi');
            });
            interaction.reply(output);
            return true;
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
            return true;
        }
    }
}
