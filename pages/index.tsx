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
        An error occured.
        <Login />
      </div>
    );
  }

  if (!data || _.size(data) === 0) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      hello {token}
      {!token && <Login />}
      <div>{data.me.display_name}</div>
      <div>
        {data.me.playlists.map(p => {
          return (
            <Link key={p.id} href={`/playlist?id=${p.id}&userId=${data.me.id}`}>
              <a>{p.name}</a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
