import { spotifyApi } from "./spotifyApi";
import { reorder } from "./reorder";

export async function syncReorderedPlaylist(
  playlistId: string,
  tracks: Array<{ id: string }>,
  newOrder: number[]
) {
  if (tracks.length !== newOrder.length) {
    throw new Error("Order doesn't specify ordering for all tracks");
  }
  console.log("new order", newOrder);

  for (const { sourceIndex, targetIndex, state } of reorder(newOrder)) {
    // apply reorder online
    await spotifyApi.reorderTracksInPlaylist(
      playlistId,
      sourceIndex,
      targetIndex
    );

    console.log("reorder", state);
  }
}
