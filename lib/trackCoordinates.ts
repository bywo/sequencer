import * as _ from "lodash";

interface AudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
}

function times100(n: number) {
  return n * 100;
}

export function getTrackCoords(
  tracks: AudioFeatures[]
): { coords: number[][]; dimensions: Array<keyof AudioFeatures> } {
  const tempos = tracks.map((t: any) => t.tempo);
  const minTempo = _.min(tempos) as number;
  const maxTempo = _.max(tempos) as number;

  const loudnessValues = tracks.map((t: any) => t.loudness);
  const minLoudness = _.min(loudnessValues) as number;
  const maxLoudness = _.max(loudnessValues) as number;

  const dimensions: Array<[keyof AudioFeatures, (i: number) => number]> = [
    ["danceability", times100],
    ["energy", times100],
    ["speechiness", times100],
    ["acousticness", times100],
    ["valence", times100],
    // "instrumentalness",
    [
      "tempo",
      (t: number) => ((t - minTempo) / (maxTempo - minTempo)) * 0.5 * 100
    ],
    [
      "loudness",
      (l: number) => ((l - minLoudness) / (maxLoudness - minLoudness)) * 100
    ]
  ];

  const coords = tracks.map((t: any) => {
    return dimensions.map(d => {
      const [name, mapper] = d;
      const rawValue = t[name];
      return mapper(rawValue);
    });
  });

  return {
    coords,
    dimensions: dimensions.map(d => d[0])
  };
}
