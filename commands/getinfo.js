const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const ytdl = require('ytdl-core');

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
            function secsToTime(length) {
                const hours = Math.floor(length / 3600);
                const mins = Math.floor(length / 60) - (hours * 60);
                const secs = length - (hours * 3600) - (mins * 60);
                return `${hours}:${mins}:${secs}`;
            }
            var output;
            await ytdl.getInfo(requestedSong).then(response=>{
                output =
                    `<https://youtu.be/${response.player_response.videoDetails.videoId}>\n` +
                    '```' + `Название: ${response.player_response.videoDetails.title}\n` +
                    `Длина: ${secsToTime(response.player_response.videoDetails.lengthSeconds)}\n` +
                    `Автор: ${response.player_response.videoDetails.author}\n` +
                    `Просмотров: ${response.player_response.videoDetails.viewCount}\n` +
                    `Описание:\n` +
                    `${response.player_response.videoDetails.shortDescription}` +
                    '```';
                output = output.replace(/discord[.](gg|io|me|li|com|net|new|gift|gifts|media)[\/]/gmiu, (match)=>{
                    return match.replace(/(gg|io|me|li|com|net|new|gift|gifts|media)/gmiu, 'nashi');
                });
            });
            interaction.reply(output);
        } else {
            interaction.reply('Мур! Чё надо? Мямяу!');
        }
    }
}
