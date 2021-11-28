const ytdl = require('ytdl-core');

module.exports = class LinkChecker {
    static checkLink (link) {
        if (
            this.checkLinkYouTube(link)
            // || this.checkLinkSpotify(link)
            // || this.checkLinkSoundCloud(link)
        ) {
            return true;
        }
    }

    static async checkLinkYouTubeForSureAsync (link) {
        try {
            await ytdl.getInfo(link).then(()=>{
                return true;
            });
        } catch (e) {
            return false;
        }
    }

    static checkLinkYouTube (link) {
        return ytdl.validateURL(link);
    }
    static checkLinkYouTubeWithRegExp (link) {
        return link.match(
            /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/gsi
        ) ? true : false;
    }
}