import * as _ from "lodash";
const Combinatorics = require("js-combinatorics");
var distance = require("euclidean-distance");
import solve from "./tsp";
import logTable from "./logTable";

export interface TrackWithFeatures {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
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

interface TrackCoord {
  id: number;
  coords: number[];
}
type Pair = [TrackCoord, TrackCoord];

function times100(n: number) {
  return n * 100;
}

export default function sequence(
  tracks: TrackWithFeatures[]
): TrackWithFeatures[] {
  const start = Date.now();
  const tempos = tracks.map((t: any) => t.tempo);
  const minTempo = _.min(tempos) as number;
  const maxTempo = _.max(tempos) as number;

  const loudnessValues = tracks.map((t: any) => t.loudness);
  const minLoudness = _.min(loudnessValues) as number;
  const maxLoudness = _.max(loudnessValues) as number;

  const dimensions: Array<[string, Function]> = [
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

  const projected: TrackCoord[] = tracks.map((t: any, index: number) => ({
    id: index,
    coords: dimensions.map(d => {
      const [name, mapper] = d;
      const rawValue = t[name];
      return mapper(rawValue);
    })
  }));

  let order = solve(
    projected,
    (a, b) => distance(a.coords, b.coords),
    0.999995
  );

  // now find longest segment and chop there
  let max = { index: 0, distance: 0 };
  for (let i = 0; i < order.length; i++) {
    const nextIndex = (i + 1) % order.length;
    const d = distance(
      projected[order[i]].coords,
      projected[order[nextIndex]].coords
    );
    if (d > max.distance) {
      max = {
        index: i,
        distance: d
      };
    }
  }
  order = [
    ...order.slice((max.index + 1) % order.length, order.length),
    ...order.slice(0, (max.index + 1) % order.length)
  ];

  let totalDistance = 0;
  for (let i = 1; i < order.length; i++) {
    totalDistance += distance(
      projected[order[i]].coords,
      projected[order[i - 1]].coords
    );
  }

  const renderedSequence = order.map(index => tracks[projected[index].id]);
  console.log("totalDistance (annealing)", totalDistance, Date.now() - start);
  return renderedSequence;
}
