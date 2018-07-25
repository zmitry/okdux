import { StandardAction, StandardActionPayload } from "../action";
export declare const reducerSymbol: unique symbol;
export declare function isReducer(reducer: any): any;
export declare class BaseReducerBuilder<T> {
    initialState: T;
    handlers: {};
    parent: any;
    path: any;
    private [reducerSymbol];
    constructor(initialState: T);
    setPath(path: any): void;
    getPath(): any;
    on<E>(action: StandardAction<E>, handler: any): this;
    select: <R>(rs: R) => any;
    mapState: (fn?: <T>(d: T, ..._: any[]) => T) => (state: any, props: any) => any;
    reset: (action: any) => void;
    reducer: <P>(state: T, action: StandardActionPayload<P>) => T;
}
