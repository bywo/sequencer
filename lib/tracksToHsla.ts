import { AudioFeatures } from "./types";

export default function tracksToHsla(tracks: AudioFeatures[]): string[] {
  return tracks.map(t => `hsla(${t.valence * 360}, 100%, 50%, 1`);
}
/*
Hue
  "valence",

Sat
["energy",
"loudness",

Luma
    ["danceability",
      "tempo",

Nothing (for now)
    ["speechiness",
    ["acousticness",
    */
