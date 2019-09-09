import range from "lodash/range";
import isEqual from "lodash/isEqual";

export function* reorder(newOrder: number[]) {
  let currentOrder = range(newOrder.length);
  while (!isEqual(currentOrder, newOrder)) {
    const targetIndex = newOrder.findIndex(
      (val, i) => newOrder[i] !== currentOrder[i]
    );

    const originalTrackIndex = newOrder[targetIndex];
    const sourceIndex = currentOrder.indexOf(originalTrackIndex);

    let state = [...currentOrder];
    state.splice(sourceIndex, 1);
    state.splice(targetIndex, 0, originalTrackIndex);

    yield { sourceIndex, targetIndex, state };

    currentOrder = state;
  }
}
