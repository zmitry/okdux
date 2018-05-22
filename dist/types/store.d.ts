import { ChangesTracker } from "./changesTracker";
export interface IStore<T> {
    map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
    compute: <P, R extends {
        [F in keyof P]: <D>(arg: T) => D;
    }, A, Rd = null>(data: R, mixin: (data: T) => Rd) => IStore<{
        [Z in keyof R]: ReturnType<R[Z]>;
    } & Rd>;
}
export declare class MultiTrack {
    trackers: {};
    map: any;
    mix: any;
    keys: any;
    values: {};
    constructor({map, mix}: {
        map: any;
        mix?: (d: any) => any;
    });
    compute(data: any, changedKeys: any): any;
}
export declare class Store<T> implements IStore<T> {
    reactors: any[];
    observers: any[];
    selector: any;
    currentState: any;
    root: boolean;
    initialized: boolean;
    computed: MultiTrack;
    type: number;
    changesTracker: ChangesTracker;
    getState(): any;
    subscribe(fn: any): () => any[];
    constructor(data: any, type: any);
    forEach(fn: any): void;
    use(dataOrFn: any): any;
    addStore(store: any): void;
    compute(map: any, mix: any): Store<{}>;
    map(fn: any, shouldWatchNested: any): Store<{}>;
    handleChanged(computedData: any, keys: any): void;
    run(data: any, keys: any, {context}: {
        context: any;
    }): void;
    set(data: any, keys: any): void;
}
