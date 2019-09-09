import React, { useMemo, useState, useCallback } from "react";
import range from "lodash/range";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import sequenceGreedyClusters from "../lib/sequenceGreedyClusters";
import { AudioFeatures } from "../lib/types";
import { getTrackCoords } from "../lib/trackCoordinates";
import { syncReorderedPlaylist } from "../lib/syncReorderedPlaylist";
import Button from "../components/Button";
const skmeans = require("skmeans");
import FlipMove from "react-flip-move";

const QUERY = gql`
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
          preview_url
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
          preview_url: string | null;
        };
      }>;
    };
  }>(QUERY, {
    variables: {
      playlistId: id,
      userId: userId
    },
    fetchPolicy: "network-only"
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

  // console.log(data);

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

  const [previewTrack, setPreviewTrack] = useState<string>();
  const [previewProgress, setPreviewProgress] = useState<number>(0);

  if (!data) {
    return "Loading...";
  }

  const trackOrder = sequenced || range(data.playlist.tracks.length);

  let previewUrl;
  if (data && previewTrack) {
    const track = data.playlist.tracks.find(t => t.track.id === previewTrack);
    if (track) {
      previewUrl = track.track.preview_url;
    }
  }

  return (
    <div>
      <audio
        autoPlay
        src={previewUrl || undefined}
        onEnded={() => setPreviewTrack(undefined)}
        onTimeUpdate={e =>
          setPreviewProgress(
            e.currentTarget.currentTime / e.currentTarget.duration
          )
        }
      />
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
      <div style={{ position: "relative" }}>
        <FlipMove typeName={null} staggerDurationBy={30}>
          {trackOrder.map(i => {
            const color = colors[i];
            const track = data.playlist.tracks[i].track;
            return (
              <div key={track.id}>
                <Track
                  key={track.id}
                  color={color}
                  {...track}
                  onClick={() => {
                    setPreviewTrack(track.id);
                    setPreviewProgress(0);
                  }}
                  progress={
                    track.id === previewTrack ? previewProgress : undefined
                  }
                />
              </div>
            );
          })}
        </FlipMove>
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
  color,
  progress,
  onClick
}: {
  name: string;
  artists: Array<{ name: string }>;
  color: string;
  progress?: number;
  onClick?: any;
}) {
  return (
    <div
      style={{
        background: color,
        color: "white",
        padding: 10,
        position: "relative"
      }}
      onClick={onClick}
    >
      {progress !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            background: "black",
            opacity: 0.5
          }}
        ></div>
      )}
      <div style={{ position: "relative" }}>
        <div>{name}</div>
        <div style={{ fontSize: "12px" }}>
          <Join nodes={artists.map(a => a.name)} joiner=", " />
        </div>
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
