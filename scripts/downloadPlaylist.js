const fs = require("fs");
const _ = require("lodash");
var SpotifyWebApi = require("spotify-web-api-node");

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  // clientId: 'fcecfc72172e4cd267473117a17cbd4d',
  // clientSecret: 'a6338157c9bb5ac9c71924cb2940e1a7',
  // redirectUri: 'http://www.example.com/callback'
});

spotifyApi.setAccessToken(
  "BQA6RG4lT3xgKbnFokvmSx5llvyligdI9IzDxNVoeF6R6pJIg3u21fCm0QEhD-Vx8KurEJ2CXg-pZQSKm4yj_1MPTIm_27q93chNSKDFqYRlp12b34pCrGFNd9Mp_0e2P6511hTWNAylZ9VpuKJeeyxzKIn0l7WG7nfKw13_AuEGcJq-dicb-xNlglzhOJK3-ylabtLnPwH8HOkNiLbB-p-cEt2Lio-L"
);

process.on("unhandledRejection", e => {
  console.error(e);
  console.error(e.stack);
  process.exit(1);
});

const playlistUserId = "byronmwong";
const playlistId = "7FLJa4J9fbKYiZsCILkZkq";

(async function() {
  // TODO: pagination
  const {
    body: { items: playlistAdds }
  } = await spotifyApi.getPlaylistTracks(playlistId);

  const tracks = playlistAdds.map(a => a.track);
  const tracksById = _.keyBy(tracks, "id");

  const trackIds = tracks.map(track => track.id);
  // NOTE: max 100 per call
  const {
    body: { audio_features: trackFeatures }
  } = await spotifyApi.getAudioFeaturesForTracks(trackIds);
  const fullData = trackFeatures.map(f => ({
    ...f,
    ...tracksById[f.id]
  }));
  console.log(fullData);

  fs.writeFileSync("tracks.json", JSON.stringify(fullData, null, 2));
})();

/*
   { danceability: 0.601,
     energy: 0.31,
     key: 2,
     loudness: -13.843,
     mode: 0,
     speechiness: 0.0354,
     acousticness: 0.889,
     instrumentalness: 0.911,
     liveness: 0.115,
     valence: 0.156,
     tempo: 76.889,
*/
