import App from "next/app";
import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import withApolloClient from "../lib/with-apollo-client";
import Head from "next/head";

class MyApp extends App {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <>
        <Head>
          <link
            href="https://fonts.googleapis.com/css?family=Alfa+Slab+One&display=swap"
            rel="stylesheet"
            key="google-font-alfa"
          />
        </Head>
        <style global jsx>{`
          body {
            font-family: "Alfa Slab One", cursive;
          }
        `}</style>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </>
    );
  }
}

export default withApolloClient(MyApp);
