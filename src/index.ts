import { IReducerBuilder, ReducerBuilder, R } from "./createReducer";
import { Store } from "./store";
export function createState<T>(initialState: T): IReducerBuilder<R<T>> {
  if (initialState === undefined) {
    throw new Error("initial state cannot be undefined");
  }
  const reducer = new ReducerBuilder<T>(initialState);
  const store = new Store(reducer.select);
  const res = Object.assign(reducer, store);
  // @ts-ignore
  return res;
}

export * from "./createReducer";
export * from "./createAction";
