const { SlashCommandBuilder } = require('@discordjs/builders');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const LinkChecker = require(`${appDir}/vendor/LinkChecker`);
const playNewSong = require(`${appDir}/vendor/playNewSong`);
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports ={
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Сыграть песню')
        .addStringOption(option =>
            option.setName('ссылка')
                .setDescription('ссылка на трек!')
                .setRequired(true)),
    async execute(interaction){
        const songQueue = require(`${appDir}/vendor/songQueue`);
        console.log('play!');
        const guildId = interaction.guild.id;
        const url = interaction.options.getString('ссылка');
        let res;
        await LinkChecker.checkLinkYouTubeForSureAsync(url).then(r=>{ // <-- Существует ли видео по ссылке.
            if (r == false) {
                res = false;
            } else {
                res = true;
            }
        });
        if (LinkChecker.checkLink(url) && res) {
            songQueue[guildId].appendQueue(url);
            if (!getVoiceConnection(interaction.guild.id)) {
                try {
                    var connection = joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator,
                    });
                  } catch (e) {
                    if (e instanceof TypeError) {
                        interaction.reply('А куда играть-то?!');
                        return;
                    } else {
                      console.error(e)
                      return;
                    }
                  }
                }
            playNewSong(guildId);
            interaction.reply('Мур!');
        } else {
            interaction.reply('Кошмаришь меня?!');
            return false;
        }
    }
}
