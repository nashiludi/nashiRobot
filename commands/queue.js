const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Args = require(`${appDir}/vendor/Args`);
const ytdl = require('ytdl-core');
const getInfoYouTube = require(`${appDir}/vendor/getInfoYouTube`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Очередь музона')
        .addStringOption(option =>
            option.setName('параметры')
                .setDescription('параметры команды')
                .setRequired(false)),
    async execute(interaction){
        const songQueue = require(`${appDir}/vendor/songQueue`);
        var guildId = interaction.guild.id;
        if (songQueue[guildId].getQueue().length == 0) {
            await interaction.reply('Очередь пуста!');
            return true;
        }
        var args = Args.getArgsForQueue(interaction.options.getString('параметры'));

        args.forEach(arg => {
            switch (arg) {
                case 'd':
                    displayQueue(songQueue[guildId].getQueue());
                    break;
                // case 'c':
                //     clearQueue(songQueue);
                //     break;
                default:
                    break;
            }
        });
        async function displayQueue(songQueue) {
            // Logger.log(JSON.stringify(songQueue));
            if (songQueue) {
                const newSongQueue = [];
                songQueue.forEach((element, i) => {
                    let result = element.title;
                    if(result.length>65){
                        result = result.slice(0, 65);
                        result = result.concat('...');
                    }
                    newSongQueue[i] = result;
                });
                var output = 'Что тут у нас... ```';
                await newSongQueue.forEach((element, i) => {
                    if(i+1<10){
                        output = output.concat(`\n${i+1} | ${element}`);
                    } else {
                        output = output.concat(`\n${i+1}| ${element}`);
                    }
                    if(i==0) {
                        output = output.concat(' << ИГРАЕТ');
                    }
                });
                output = output.concat('```');
                await interaction.reply(output);
            }
            return output;
        }

        // async function clearQueue(songQueue) {
        //     songQueue[guildId].clearQueue();
        //     await interaction.channel.send('Чистенько!');
        //     return true;
        // }
    }
}

//TODO: (необязательно) придумать новую реализацию параметра clear