const playdl = require('play-dl');

module.exports = class GetInfo {
    static async getInfoYouTube(title) {
        const result = await playdl.search(title, { limit : 1 });
        return result;
    }
    static async getInfoSpotifyTrack(title) {
        if (playdl.is_expired()) {
            await playdl.refreshToken();
        }
        const result = await playdl.search(title, { limit: 1, source : { spotify : "track" } });
        return result;
    }
    // static async getInfoSpotifyPlaylist(title) {
    //     if (playdl.is_expired()) {
    //         await playdl.refreshToken();
    //     }
    //     const result = await playdl.search(title, { limit: 1, source : { spotify : "playlist" } });
    //     return result;
    // }
    // static async getInfoSpotifyAlbum(title) {
    //     if (playdl.is_expired()) {
    //         await playdl.refreshToken();
    //     }
    //     const result = await playdl.search(title, { limit: 1, source : { spotify : "album" } });
    //     return result;
    // }
    static async getInfoSpotify(title) {
        if (playdl.is_expired()) {
            await playdl.refreshToken();
        }
        if (playdl.sp_validate(title) == 'track' || playdl.sp_validate(title) ==  'playlist' || playdl.sp_validate(title) ==  'album') {
            try {
                const resultFromLink = await playdl.spotify(title);
                return resultFromLink;
            } catch(e) {
                return false;
            }
        } else if (playdl.sp_validate(title) == 'search') {
            // let resultFromSearch = await this.getInfoSpotifyPlaylist(title);
            // if (resultFromSearch[0] == undefined) resultFromSearch = await this.getInfoSpotifyAlbum(title);
            // if (resultFromSearch[0] == undefined) resultFromSearch = await this.getInfoSpotifyTrack(title);
            let resultFromSearch = await this.getInfoSpotifyTrack(title);
            if (resultFromSearch[0] == undefined) return false;
            return resultFromSearch[0];
        } else {
            return false;
        }
    }

    static async getYouTubeVideoFromSpotifyInfo(info) {
        if (playdl.is_expired()) {
            await playdl.refreshToken();
        }
        if (info.type == 'track') {
            const result = await this.getInfoYouTube(`${info.name} - ${info.artists[0]?.name ?? ''}`);
            result[0].origTitle = info.name;
            result[0].origUrl = info.url;
            if (info.artists[0]?.name) result[0].origArtist = info.artists[0]?.name;
            result[0].primaryType = info.type;
            return result[0];
        } else if (info.type == 'playlist' || info.type == 'album') {
            const result = Promise.all(await info.fetched_tracks.get('1').map(async(element, i) => {
                return new Promise(async(resolve, reject)=>{
                    await this.getInfoYouTube(`${element.name} - ${element.artists[0]?.name ?? ''}`).then(r=>{
                        r[0].origTitle = element.name;
                        r[0].origUrl = element.url;
                        if (element.artists[0]?.name) r[0].origArtist = element.artists[0]?.name;
                        if (info.artists[0]?.name) r[0].primaryArtist = info.artists[0]?.name;
                        r[0].primaryTitle = info.name;
                        r[0].primaryUrl = info.url;
                        r[0].primaryType = info.type;
                        resolve(r[0]);
                    });
                });
            })).then((r)=>{return r;});
            return result.then(r=>{return r;});
        } else {
            return false;
        }
    }

    static async spotifyJob(title) {
        const info = await this.getInfoSpotify(title);
        if (!info) return false;
        const response = await this.getYouTubeVideoFromSpotifyInfo(info);
        if (!response) return false;
        if (Array.isArray(response)) return {data: response, type: response[0].primaryType};
        return {data: response, type: response.primaryType};
    }
}
