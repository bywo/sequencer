import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import * as _ from "lodash";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

import Login from "../components/Login";

const GET_DOGS = gql`
  query {
    me {
      id
      display_name
      playlists(limit: -1) {
        id
        name
      }
    }
  }
`;

export default function App() {
  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const matches = /access_token=([^&]+)(&|$)/.exec(window.location.hash);
    return matches ? matches[1] : undefined;
  }, [typeof window !== "undefined" ? window.location.hash : false]);

  const { loading, error, data } = useQuery<{
    me: {
      id: string;
      display_name: string;
      playlists: Array<{
        id: string;
        name: string;
      }>;
    };
  }>(GET_DOGS, {});

  if (error) {
    return (
      <div>
        <h1>SmartShuffle</h1>
        <div style={{ marginBottom: 10 }}>Login to Spotify to get started!</div>
        <Login />
      </div>
    );
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {!token && <Login />}
      <h1>SmartShuffle</h1>
      <div style={{ marginBottom: 10 }}>
        Hey {data.me.display_name}! Choose a playlist.
      </div>
      <div>
        {data.me.playlists.map(p => {
          return (
            <Link key={p.id} href={`/playlist?id=${p.id}&userId=${data.me.id}`}>
              <a style={{ textDecoration: "none" }}>
                <PlaylistListItem name={p.name} />
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PlaylistListItem({ name }: { name: string }) {
  return (
    <div
      style={{
        color: "black",
        textDecoration: "none",
        padding: 10,
        fontSize: 16
      }}
    >
      {name}
    </div>
  );
}
