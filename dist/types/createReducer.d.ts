import { StandardAction, StandardActionPayload } from "./createAction";
export declare const reducerPathSymbol: unique symbol;
export declare const ctxSymbol: unique symbol;
interface IReducerBuilder<T> {
    select<RootState>(rootState: RootState): T;
    buildReducer(path: string): <P>(state: T, action: any) => T;
    mapState<R, P>(fn: (state: T, props: P) => R): (root: any) => R;
    handle(event: string | string[], handler: (state: T, payload: any, meta: any) => T | void): IReducerBuilder<T>;
    on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
}
declare type Unpacked<T> = T extends IReducerBuilder<infer U> ? U : T extends StandardAction<infer P> ? P : T;
declare type R<T> = {
    [P in keyof T]: Unpacked<T[P]>;
};
export declare class ReducerBuilder<T> implements IReducerBuilder<T> {
    initialState: T;
    handlers: {};
    private [reducerPathSymbol];
    private [ctxSymbol];
    private _reducer;
    constructor(initialState: T);
    on(action: any, handler: any): this;
    handle(type: any, handler: any): this;
    select: <R>(rs: R) => any;
    mapState: (fn: any) => (state: any, props: any) => any;
    readonly reducer: any;
    buildReducer(path: string): <P>(state: T, action: StandardActionPayload<P>) => T;
}
export { R, Unpacked, IReducerBuilder };
