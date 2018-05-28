import {
  IReducerBuilder,
  createState as state,
  combineState,
  R,
  reducerPathSymbol
} from "./createReducer";
import { Store, IStore } from "./store";

export function createState<T>(initialState: T): IReducerBuilder<R<T>> & IStore<R<T>> {
  if (initialState === undefined) {
    throw new Error("initial state cannot be undefined");
  }
  let reducer;
  if (typeof initialState === "object") {
    const firstKey = Object.keys(initialState)[0];
    if (initialState[firstKey] && initialState[firstKey].reducer) {
      reducer = combineState(initialState);
    } else {
      reducer = state(initialState);
    }
  } else {
    reducer = state(initialState);
  }
  // @ts-ignore
  const store = new Store(reducer.select);
  const res = Object.assign(reducer, store);

  // @ts-ignore
  const res2 = Object.assign(res, {
    use: store.use.bind(res),
    set: store.set.bind(res),
    run: store.run.bind(res),
    handleChanged: store.handleChanged.bind(res),
    addStore: store.addStore.bind(res),
    map: store.map.bind(res),
    getState: store.getState.bind(res),
    forEach: store.forEach.bind(res),
    subscribe: store.subscribe.bind(res)
  });
  // @ts-ignore
  return res2;
}

export * from "./createAction";
export * from "./store";
export * from "./Consumer";
export * from "./ministore";
