const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const Args = require(`${appDir}/vendor/Args`);

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
            return;
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
        await interaction.reply('Мур!');
        async function displayQueue(songQueue) {
            if (songQueue) {
                var output = 'Что тут у нас... ```';
                await songQueue.forEach((element, i) => {
                    output = output.concat(`\n${i+1} | ${element}`);
                    if(i==0) {
                        output = output.concat(' << ИГРАЕТ');
                    }
                });
                output = output.concat('```');
                await interaction.channel.send(output);
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