import range from "lodash/range";
import isEqual from "lodash/isEqual";
import { spotifyApi } from "./spotifyApi";

export async function syncReorderedPlaylist(
  playlistId: string,
  tracks: Array<{ id: string }>,
  newOrder: number[]
) {
  if (tracks.length !== newOrder.length) {
    throw new Error("Order doesn't specify ordering for all tracks");
  }
  console.log("new order", newOrder);

  let currentOrder = range(tracks.length);
  while (!isEqual(currentOrder, newOrder)) {
    const targetIndex = newOrder.findIndex(
      (val, i) => newOrder[i] !== currentOrder[i]
    );

    const originalTrackIndex = newOrder[targetIndex];
    const sourceIndex = currentOrder.indexOf(originalTrackIndex);

    // apply reorder online
    await spotifyApi.reorderTracksInPlaylist(
      playlistId,
      sourceIndex,
      targetIndex
    );
    // apply reorder locally
    currentOrder.splice(sourceIndex, 1);
    currentOrder.splice(targetIndex, 0, originalTrackIndex);
    console.log("reorder", currentOrder);
  }
}
