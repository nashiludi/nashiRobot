const playdl = require('play-dl');

module.exports = async function getInfoYouTube(url) {
    let result = await playdl.search(url, { limit : 1 });
    return result;
}
