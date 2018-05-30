import { ChangesTracker } from "./changesTracker";
export interface IStore<T> {
    map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}
export declare class Store<T> implements IStore<T> {
    reactors: any[];
    observers: any[];
    keys: {};
    selector: any;
    currentState: any;
    root: boolean;
    initialized: boolean;
    computed: boolean;
    type: number;
    changesTracker: ChangesTracker;
    getState(): any;
    subscribe(fn: any): () => any[];
    constructor(data: any, type: any);
    use(dataOrFn: any): any;
    addStore(store: any): void;
    map(fn: any, shouldWatchNested: any): Store<{}>;
    handleChanged(computedData: any, keys: any): void;
    run(data: any, keys: any): void;
    set(data: any, keys: any): void;
}
export declare function compose(...stores: IStore<any>[]): Store<{}>;
