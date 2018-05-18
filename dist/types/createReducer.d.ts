import { StandardAction } from "./createAction";
export declare const getKeys: () => any[];
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
declare function createState<T>(initialState: T): IReducerBuilder<R<T>>;
export { createState, R, Unpacked, IReducerBuilder };
