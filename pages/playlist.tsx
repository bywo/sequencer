import React, { useEffect, useMemo, useState, useCallback } from "react";
import range from "lodash/range";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import sequenceGreedyClusters from "../lib/sequenceGreedyClusters";
import { AudioFeatures } from "../lib/types";
import { getTrackCoords } from "../lib/trackCoordinates";
import { syncReorderedPlaylist } from "../lib/syncReorderedPlaylist";
import Button from "../components/Button";
const skmeans = require("skmeans");

const GET_DOGS = gql`
  query($playlistId: String!, $userId: String!) {
    playlist(id: $playlistId, userId: $userId) {
      name
      tracks(limit: -1) {
        track {
          id
          name
          artists(limit: -1) {
            id
            name
          }
          audio_features {
            acousticness
            analysis_url
            danceability
            duration_ms
            energy
            instrumentalness
            key
            liveness
            loudness
            mode
            speechiness
            tempo
            time_signature
            track_href
            valence
          }
        }
      }
    }
  }
`;
export default function Playlist({
  id,
  userId
}: {
  id: string;
  userId: string;
}) {
  const { loading, error, data, refetch } = useQuery<{
    playlist: {
      name: string;
      tracks: Array<{
        track: {
          id: string;
          name: string;
          artists: Array<{
            id: string;
            name: string;
          }>;
          audio_features: AudioFeatures;
        };
      }>;
    };
  }>(GET_DOGS, {
    variables: {
      playlistId: id,
      userId: userId
    }
  });

  const [sequenced, setSequenced] = useState<number[]>();
  const onRequestSequence = useCallback(() => {
    if (data && data.playlist.tracks) {
      const input = data.playlist.tracks.map(t => {
        const { audio_features, ...rest } = t.track;

        return {
          ...rest,
          ...audio_features
        };
      });
      // const annealing = sequenceAnnealing(input);
      // const greedy = sequence(input);
      const clusters = sequenceGreedyClusters(input);

      setSequenced(clusters);
    }
  }, [data && data.playlist.tracks]);

  console.log(data);

  const clusters = useMemo(() => {
    if (data && data.playlist.tracks) {
      const { coords } = getTrackCoords(
        data.playlist.tracks.map(t => t.track.audio_features)
      );
      const c = skmeans(coords, Math.min(7, data.playlist.tracks.length));
      console.log("kmeans", c);
      return c;
    }
    return undefined;
  }, [data && data.playlist.tracks]);

  const colors = useMemo(() => {
    if (clusters) {
      const sourceColors = [
        "#76E63B", // green
        "#5DCFFC", // light blue
        "#5D7DFC", // blue
        "#7E5DFC", // purple
        "#F25DFC", // pink
        "#FC5D70", // red
        "#FC985D", // orange
        "#FFDD21" // yellow
      ];
      return clusters.idxs.map((i: number) => sourceColors[i]);
    }
    return [];
  }, [clusters]);

  const [didSave, setDidSave] = useState();

  const onSave = useCallback(async () => {
    if (data && sequenced) {
      setDidSave(true);
      await syncReorderedPlaylist(
        id,
        data.playlist.tracks.map(t => t.track),
        sequenced
      );
    }
  }, [data, sequenced]);

  // if we saved the reordering, trigger a refetch on unmount
  useEffect(() => {
    return () => {
      if (didSave) {
        refetch();
      }
    };
  }, [didSave]);

  if (!data) {
    return "Loading...";
  }

  const trackOrder = sequenced || range(data.playlist.tracks.length);

  return (
    <div>
      <h1>{data.playlist.name}</h1>
      <div style={{ marginBottom: 10 }}>
        {sequenced ? (
          didSave ? (
            "All done!"
          ) : (
            <Button onClick={onSave}>Save to Spotify</Button>
          )
        ) : (
          <Button onClick={onRequestSequence}>SmartShuffle</Button>
        )}
      </div>
      <div>
        {trackOrder.map(i => {
          const color = colors[i];
          const track = data.playlist.tracks[i].track;
          return <Track key={track.id} color={color} {...track} />;
        })}
      </div>
    </div>
  );
}

Playlist.getInitialProps = ({ query }: { query: { [k: string]: string } }) => ({
  id: query.id,
  userId: query.userId
});

function Track({
  name,
  artists,
  color
}: {
  name: string;
  artists: Array<{ name: string }>;
  color: string;
}) {
  return (
    <div style={{ background: color, color: "white", padding: 10 }}>
      <div>{name}</div>
      <div style={{ fontSize: "12px" }}>
        <Join nodes={artists.map(a => a.name)} joiner=", " />
      </div>
    </div>
  );
}

function Join({
  nodes,
  joiner
}: {
  nodes: React.ReactNode[];
  joiner: React.ReactNode;
}) {
  const out: React.ReactNode[] = [];
  nodes.forEach((n, i) => (out[i * 2] = n));
  for (let i = 0; i < nodes.length - 1; i++) {
    out[2 * i + 1] = joiner;
  }

  return React.createElement(React.Fragment, {}, ...out);
}
