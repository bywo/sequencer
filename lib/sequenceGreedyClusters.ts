import * as _ from "lodash";
const Combinatorics = require("js-combinatorics");
var distance = require("euclidean-distance");
import logTable from "./logTable";
import minByIterator from "./minByIterator";

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

class Segment<P> {
  public points: P[];
  constructor(p: P, readonly distanceFn: (a: P, b: P) => number) {
    this.points = [p];
  }

  distance(s: Segment<P>) {
    return Math.min(
      this.distanceFn(_.first(this.points) as P, _.first(s.points) as P),
      this.distanceFn(_.first(this.points) as P, _.last(s.points) as P),
      this.distanceFn(_.last(this.points) as P, _.first(s.points) as P),
      this.distanceFn(_.last(this.points) as P, _.last(s.points) as P)
    );
  }

  join(s: Segment<P>) {
    const minDistance = this.distance(s);
    if (
      this.distanceFn(_.first(this.points) as P, _.first(s.points) as P) ===
      minDistance
    ) {
      this.points = [..._.reverse(this.points), ...s.points];
    } else if (
      this.distanceFn(_.first(this.points) as P, _.last(s.points) as P) ===
      minDistance
    ) {
      this.points = [...s.points, ...this.points];
    } else if (
      this.distanceFn(_.last(this.points) as P, _.first(s.points) as P) ===
      minDistance
    ) {
      this.points = [...this.points, ...s.points];
    } else if (
      this.distanceFn(_.last(this.points) as P, _.last(s.points) as P) ===
      minDistance
    ) {
      this.points = [...this.points, ..._.reverse(s.points)];
    }
  }
}

function times100(n: number) {
  return n * 100;
}

export default function sequenceGreedyClusters(
  tracks: TrackWithFeatures[],
  debug?: boolean
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

  const tcDistance = (a: TrackCoord, b: TrackCoord) =>
    distance(a.coords, b.coords);

  let segments = projected.map(tc => new Segment(tc, tcDistance));

  while (segments.length > 1) {
    const pairs: {
      next(): [Segment<TrackCoord>, Segment<TrackCoord>] | undefined;
    } = Combinatorics.bigCombination(segments, 2);
    const minPair = minByIterator(pairs, ([s1, s2]) => s1.distance(s2));
    minPair[0].join(minPair[1]);
    segments = _.without(segments, minPair[1]);
  }

  const sequenced = segments[0].points;

  let totalDistance = 0;
  for (let i = 1; i < sequenced.length; i++) {
    totalDistance += distance(sequenced[i].coords, sequenced[i - 1].coords);
  }

  const renderedSequence = sequenced.map(tc => tracks[tc.id]);
  console.log("totalDistance (clusters)", totalDistance, Date.now() - start);
  return renderedSequence;
}
