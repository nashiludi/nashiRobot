const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Args = require(`${appDir}/vendor/Args`);
const Logger = require(`${appDir}/vendor/Logger`);

module.exports ={
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Очередь музона')
        .addStringOption(option =>
            option.setName('параметры')
                .setDescription('параметры команды')
                .setRequired(false)),
    async execute(interaction, args = undefined){
        const { client } = require(`${appDir}/vendor/client`);
        var guildId = interaction.guild.id;
        if (client.queue[guildId].getQueue().length == 0) {
            interaction.reply('Очередь пуста!');
            return true;
        }
        if (args && args[0]) {
            var argsForQueue = Args.getArgsForQueue(args[0]);
        } else {
            var argsForQueue = Args.getArgsForQueue(interaction.options.getString('параметры'));
        }
        argsForQueue.forEach(arg => {
            switch (arg) {
                case 'd':
                    displayQueue(client.queue[guildId].getQueue());
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
                    let result;
                    if (element.origTitle) {
                        result = element.origTitle;
                    } else if (element.name) {
                        result = element.name;
                    } else {
                        result = element.title;
                    }
                    if(result.length>65){
                        result = result.slice(0, 65);
                        result = result.concat('...');
                    }
                    newSongQueue[i] = result;
                });
                var output = 'Что тут у нас... ```';
                var shouldContinue = true;
                newSongQueue.forEach((element, i) => {
                    if(output.length>1900 && shouldContinue){
                        output = output.concat(`\n...`);
                        shouldContinue = false;
                    } else if(i+1<10 && shouldContinue){
                        output = output.concat(`\n${i+1} | ${element}`);
                    } else if (shouldContinue){
                        output = output.concat(`\n${i+1}| ${element}`);
                    }
                    if(i==0) {
                        output = output.concat(' << ИГРАЕТ');
                    }
                });
                output = output.concat('```');
                interaction.reply(output);
            }
            return true;
        }

        // async function clearQueue(songQueue) {
        //     client.queue[guildId].clearQueue();
        //     await interaction.channel.send('Чистенько!');
        //     return true;
        // }
    }
}

//TODO: (необязательно) придумать новую реализацию параметра clear