export type PayloadLens<P, R> = R | ((payload: P) => R);
export type LensKey<T, A> = T extends Array<infer P>
  ? PayloadLens<A, number>
  : PayloadLens<A, string>;

export type LensCreator<T, A> = {
  key<K extends keyof T>(prop: K): LensCreator<T[K], A>;
  index<R, K extends LensKey<T, A>>(prop: K): LensCreator<T extends Array<infer P> ? P : T, A>;
};

function lens(path, prop) {
  path = typeof prop !== "undefined" && prop !== null ? path.concat(prop) : path;
  return {
    key: lens.bind(null, path),
    index: lens.bind(null, path),
    path
  };
}

export function makeLens<T, A>(): LensCreator<T, A> {
  return lens.call(null, [], null);
}
