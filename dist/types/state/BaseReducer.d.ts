import { StandardAction, StandardActionPayload } from "../action";
export declare const reducerSymbol: unique symbol;
export declare const getRootStateSymbol: unique symbol;
export declare function isReducer(reducer: any): any;
export declare class BaseReducerBuilder<T> {
    initialState: T;
    handlers: {};
    parent: any;
    path: any;
    [getRootStateSymbol]: () => any;
    private [reducerSymbol];
    constructor(initialState: T);
    setPath(path: any): void;
    getPath(): any;
    getState: () => any;
    on: <E>(action: StandardAction<E>, handler: any) => this;
    select: <R>(rs: R) => any;
    mapState: (fn?: <T>(d: T, ..._: any[]) => T) => (state: any, props: any) => any;
    reset: (action: any) => this;
    reducer: <P>(state: T, action: StandardActionPayload<P>) => T;
    mixin: (fn: any) => any;
    pipe: (fn: any) => any;
}
