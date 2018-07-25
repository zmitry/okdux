import { IReducerBuilder, R } from "./state";
export declare function createState<T>(initialState: T): IReducerBuilder<R<T>>;
export * from "./action";
