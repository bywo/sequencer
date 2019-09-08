const SpotifyWebApi = require("spotify-web-api-node");

const isBrowser = typeof window !== "undefined";
let token;
if (isBrowser) {
  const matches = /access_token=([^&]+)(&|$)/.exec(window.location.hash);
  token = matches ? matches[1] : undefined;
}

export const spotifyApi = new SpotifyWebApi({
  accessToken: token
});
