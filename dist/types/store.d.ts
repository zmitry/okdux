export declare function checkKeyUsage(fn: any, data: any, context: any): any[];
export declare function wrapKeys(keys: any, data: any): void;
export interface IStore<T> {
    map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}
export declare class Store<T> implements IStore<T> {
    reactors: any[];
    observers: any[];
    selector: any;
    currentState: any;
    root: boolean;
    deps: any[];
    initialized: boolean;
    watchNested: any;
    getState(): any;
    subscribe(fn: any): () => any[];
    constructor(fn: (d: any) => any, watchNested: any);
    forEach(fn: any): void;
    use(dataOrFn: any): any;
    addStore(store: any): any;
    map(fn: any, shouldWatchNested: any): any;
    set(data: any, keys: any): void;
}
