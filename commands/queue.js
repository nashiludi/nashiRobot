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
    async execute(interaction, info){
        const { client } = require(`${appDir}/vendor/client`);
        var guildId = interaction.guild.id;
        if (client.queue[guildId].getQueue().length == 0) {
            interaction.reply('Очередь пуста!');
            return true;
        }
        if (info.type == 'message' && info.args && info.args[0]) {
            var argsForQueue = Args.getArgsForQueue(info.args[0]);
        } else if (info.type == 'interaction') {
            var argsForQueue = Args.getArgsForQueue(interaction.options.getString('параметры'));
        } else {
            var argsForQueue = Args.getArgsForQueue();
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

    }
}
