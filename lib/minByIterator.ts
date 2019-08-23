// technically not an ECMAScript iterator. just accounting for the interface that js-combinatorics provides

export default function minByIterator<T>(
  iterator: { next(): T | undefined },
  iteratee: (arg: T) => number
): T {
  let p: T | undefined;
  let min = Infinity;
  let winner: T | undefined = undefined;
  while ((p = iterator.next())) {
    const value = iteratee(p);
    if (value < min) {
      min = value;
      winner = p;
    }
  }

  return winner as T;
}
