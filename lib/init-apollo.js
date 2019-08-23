import { ApolloClient, InMemoryCache, HttpLink } from "apollo-boost";
import { SchemaLink } from "apollo-link-schema";
// import fetch from "isomorphic-unfetch";

import { getSchema } from "bywo-spotify-graphql";

import { makeExecutableSchema } from "graphql-tools";
// const typeDefs = `
//   type Query {
//     message: String
//   }
// `;
// const resolvers = {
//   Query: {
//     message: (root, args, context, info) => "hello-world"
//     // Or make a remote API call
//   }
// };
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers
// });

let apolloClient = null;

function create(initialState) {
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  const isBrowser = typeof window !== "undefined";
  let token;
  if (isBrowser) {
    const matches = /access_token=([^&]+)(&|$)/.exec(window.location.hash);
    token = matches ? matches[1] : undefined;
  }

  const schema = getSchema({ accessToken: token });

  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
    // link: new HttpLink({
    //   uri: "https://api.graph.cool/simple/v1/cixmkt2ul01q00122mksg82pn", // Server URL (must be absolute)
    //   credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
    //   // Use fetch() polyfill on the server
    //   fetch: !isBrowser && fetch
    // }),
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
