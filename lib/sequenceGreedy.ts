import * as _ from "lodash";
const Combinatorics = require("js-combinatorics");
var distance = require("euclidean-distance");
import logTable from "./logTable";
import { getTrackCoords } from "./trackCoordinates";

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
  tracks: TrackWithFeatures[],
  debug?: boolean
): TrackWithFeatures[] {
  const start = Date.now();

  const { coords, dimensions } = getTrackCoords(tracks);

  const projected: TrackCoord[] = tracks.map((t: any, index: number) => ({
    id: index,
    coords: coords[index]
  }));

  const pairs = Combinatorics.bigCombination(projected, 2);
  let max:
    | {
        distance: number;
        pair: Pair;
      }
    | undefined = undefined;

  let p: Pair;
  while ((p = pairs.next())) {
    const dist = distance(p[0].coords, p[1].coords);
    if (!max || dist > max.distance) {
      max = {
        distance: dist,
        pair: p
      };

      if (debug) {
        const rowsToLog = [p[0], p[1]].map(({ id, coords }) => {
          const track = tracks[id];
          return {
            name: track.name,
            ..._.zipObject(dimensions, coords)
          };
        });
        console.log("\nnew max", dist);
        logTable(rowsToLog, ["name", ...dimensions]);
      }
    }
  }

  // now we have our max
  if (!max) {
    throw new Error("shouldn't get here");
  }
  const sequenced = [max.pair[0]];
  let remaining = _.difference(projected, sequenced);
  while (remaining.length) {
    const prev = sequenced[sequenced.length - 1];

    const options = _.sortBy(remaining, track => {
      return distance(prev.coords, track.coords);
    });

    if (debug) {
      const rowsToLog = [prev, ...options].map(track => {
        const d = distance(prev.coords, track.coords);
        return {
          name: tracks[track.id].name,
          ..._.zipObject(dimensions, track.coords),
          distance: d
        };
      });
      console.log(`\n\nPrevious track: ${tracks[prev.id].name}`);
      logTable(rowsToLog, ["name", ...dimensions, "distance"]);
    }

    sequenced.push(options[0]);
    remaining = _.difference(projected, sequenced);
  }
  // console.log(sequenced);

  let totalDistance = 0;
  for (let i = 1; i < sequenced.length; i++) {
    totalDistance += distance(sequenced[i].coords, sequenced[i - 1].coords);
  }

  const renderedSequence = sequenced.map(tc => tracks[tc.id]);
  console.log("totalDistance (greedy)", totalDistance, Date.now() - start);
  return renderedSequence;
}
