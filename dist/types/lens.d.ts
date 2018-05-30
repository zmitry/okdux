export declare type PayloadLens<P, R> = R | ((payload: P) => R);
export declare type LensKey<T, A> = T extends Array<infer P> ? PayloadLens<A, number> : PayloadLens<A, string>;
export declare type LensCreator<T, A> = {
    key<K extends keyof T>(prop: K): LensCreator<T[K], A>;
    index<R, K extends LensKey<T, A>>(prop: K): LensCreator<T extends Array<infer P> ? P : T, A>;
};
export declare function makeLens<T, A>(): LensCreator<T, A>;
