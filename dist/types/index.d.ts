import { IReducerBuilder, R } from "./createReducer";
export declare function createState<T>(initialState: T): IReducerBuilder<R<T>>;
export * from "./createAction";
