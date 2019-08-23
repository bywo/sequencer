import React, { useEffect, useMemo, useState, useCallback } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import sequence, { TrackWithFeatures } from "../lib/sequenceGreedy";
import sequenceAnnealing from "../lib/sequenceAnnealing";
import { string } from "@amcharts/amcharts4/core";
import sequenceGreedyClusters from "../lib/sequenceGreedyClusters";
import { AudioFeatures } from "../lib/types";
import tracksToHsla from "../lib/tracksToHsla";

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
  const { loading, error, data } = useQuery<{
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

  const [sequenced, setSequenced] = useState<TrackWithFeatures[]>();
  const onRequestSequence = useCallback(() => {
    if (data && data.playlist.tracks) {
      const input = data.playlist.tracks.map(t => {
        const { audio_features, ...rest } = t.track;

        return {
          ...rest,
          ...audio_features
        };
      });
      const annealing = sequenceAnnealing(input);
      const greedy = sequence(input);
      const clusters = sequenceGreedyClusters(input);

      setSequenced(annealing);
    }
  }, [data && Object.keys(data).length && data.playlist.tracks]);

  console.log(data);

  const colors = useMemo(() => {
    if (data && Object.keys(data).length && data.playlist.tracks) {
      return tracksToHsla(
        data.playlist.tracks.map(t => t.track.audio_features)
      );
    }
    return [];
  }, [data && Object.keys(data).length && data.playlist.tracks]);

  return (
    <div>
      {id}
      <button onClick={onRequestSequence}>Sequence</button>
      {sequenced && (
        <div>
          <h2>Sequenced</h2>
          <div>
            {sequenced.map(track => {
              return (
                <div key={track.id}>
                  {track.name} {track.artists.map(a => a.name)}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <h2>Original</h2>
      {data && Object.keys(data).length && (
        <div>
          <div>{data.playlist.name}</div>
          <div>
            {data.playlist.tracks.map(({ track }, i) => {
              const color = colors[i];
              return (
                <div key={track.id} style={{ background: color }}>
                  {track.name} {track.artists.map(a => a.name)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Playlist.getInitialProps = ({ query }: { query: { [k: string]: string } }) => ({
  id: query.id,
  userId: query.userId
});
