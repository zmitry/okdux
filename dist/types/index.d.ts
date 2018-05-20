import { IReducerBuilder, R } from "./createReducer";
import { IStore } from "./store";
export declare function createState<T>(initialState: T): IReducerBuilder<R<T>> & IStore<R<T>>;
export * from "./createReducer";
export * from "./createAction";
export * from "./store";
export * from "./Consumer";
export * from "./ministore";
