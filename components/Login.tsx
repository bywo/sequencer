import { useState, useEffect } from "react";

export default function Login() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <a
      href={`https://accounts.spotify.com/authorize?client_id=39f3681cf89a42138b721da5bf98efb8&response_type=token&redirect_uri=${baseUrl}&scope=streaming%20playlist-modify-private%20playlist-modify-public`}
    >
      Login to Spotify
    </a>
  );
}
