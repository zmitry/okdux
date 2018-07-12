import { StandardAction, StandardActionPayload } from "./createAction";
interface IReducerBuilder<T> {
    stores: WrappedValues<T>;
    select<RootState>(rootState: RootState): T;
    mapState<R, P>(fn: (state: T, props: P) => R): (root: any, props) => R;
    on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
}
declare type Unpacked<T> = T extends IReducerBuilder<infer U> ? U : T extends StandardAction<infer P> ? P : T extends (...args: any[]) => infer R ? R : T;
declare type R<T> = {
    [P in keyof T]: Unpacked<T[P]>;
};
declare enum Keys {
    select = 0,
    mapState = 1,
}
declare type WrappedValues<T> = {
    [P in keyof T]: Pick<IReducerBuilder<T[P]>, keyof typeof Keys>;
};
export declare class BaseReducerBuilder<T> implements IReducerBuilder<T> {
    initialState: T;
    handlers: {};
    parent: any;
    path: any;
    constructor(initialState: T);
    setPath(path: any): void;
    getPath(): any;
    on<E>(action: StandardAction<E>, handler: any): this;
    select: <R>(rs: R) => any;
    mapState: (fn?: <T>(d: T, ..._: any[]) => T) => (state: any, props: any) => any;
    reducer: <P>(state: T, action: StandardActionPayload<P>) => T;
}
export declare type ReducerOrAction = BaseReducerBuilder<any> | CombinedReducer<any> | StandardAction<any>;
export declare class CombinedReducer<T extends {
    [i: string]: ReducerOrAction;
}> extends BaseReducerBuilder<R<T>> {
    stores: any;
    constructor(storesToParse: T);
}
export declare function createState<T>(data: T): BaseReducerBuilder<T>;
export declare function combineState<T extends {
    [i: string]: ReducerOrAction;
}>(data: T): CombinedReducer<T>;
export { R, Unpacked, IReducerBuilder, WrappedValues, Keys };
