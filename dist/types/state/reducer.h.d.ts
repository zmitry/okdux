import { StandardAction } from "../action";
export interface IReducerBuilder<T> {
    stores: WrappedValues<T>;
    select<R, P>(fn: (state: T, props?: P) => R): (root: any, props) => R;
    select<RootState>(rootState: RootState): T;
    on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
    reset<E>(event: StandardAction<E>): IReducerBuilder<T>;
    mixin<R>(fn: (A: IReducerBuilder<T>) => R): R;
}
export declare type Unpacked<T> = T extends IReducerBuilder<infer U> ? U : T extends StandardAction<infer P> ? P : T extends (...args: any[]) => infer R ? R : T;
export declare type R<T> = {
    [P in keyof T]: Unpacked<T[P]>;
};
export declare type WrappedValues<T> = {
    [P in keyof T]: IReducerBuilder<T[P]>;
};
