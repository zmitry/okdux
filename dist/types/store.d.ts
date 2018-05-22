import { ChangesTracker } from "./changesTracker";
export interface IStore<T> {
    map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}
export declare class Store<T> implements IStore<T> {
    reactors: any[];
    observers: any[];
    selector: any;
    currentState: any;
    root: boolean;
    initialized: boolean;
    watchNested: any;
    changesTracker: ChangesTracker;
    getState(): any;
    subscribe(fn: any): () => any[];
    constructor(fn: (d: any) => any, watchNested: any);
    forEach(fn: any): void;
    use(dataOrFn: any): any;
    addStore(store: any): any;
    map(fn: any, shouldWatchNested: any): any;
    set(data: any, keys: any): void;
}
