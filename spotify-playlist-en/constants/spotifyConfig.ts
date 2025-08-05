interface spotifyConfig {
    CLIENT_ID: string;
    SCOPE: string;
    REDIRECT_URI: string;
    CLIENT_SECRET: string;
    BILLBOARD_100_PLAYLIST: string;
    MY_DEFAULT_PLAYLIST: string;
    ACCESS_TOKEN_URL: string;
    AUTH_CODE_URL: string;
}

export const spotifyConfig1: spotifyConfig = {
    CLIENT_ID: "d9ca7ba48366413f82eadc7f86395150",
    SCOPE: "playlist-modify-public",
    REDIRECT_URI: "https://spotify-playlist-app-rqcw.vercel.app/callback",
    CLIENT_SECRET: "176f6cfaa92e4665a228d79b6c7c904a",
    BILLBOARD_100_PLAYLIST: "6UeSakyzhiEt4NB3UAd6NQ",
    MY_DEFAULT_PLAYLIST: "6fKsv1wxjAI2JSgz0IZucx",
    ACCESS_TOKEN_URL: "https://accounts.spotify.com/api/token",
    AUTH_CODE_URL: "https://accounts.spotify.com/authorize?"
}
