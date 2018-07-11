import { IReducerBuilder, createState as state, combineState, R } from "./createReducer";
import { createAction, StandardAction } from "./createAction";

export function createState<T>(initialState: T): IReducerBuilder<R<T>> {
  if (initialState === undefined) {
    throw new Error("initial state cannot be undefined");
  }
  let reducer;
  if (typeof initialState === "object") {
    const firstKey = Object.keys(initialState)[0];
    if (
      initialState[firstKey] &&
      (initialState[firstKey].reducer || initialState[firstKey].getType)
    ) {
      // @ts-ignore
      reducer = combineState(initialState);
    } else {
      reducer = state(initialState);
    }
  } else {
    reducer = state(initialState);
  }

  reducer.use = dispatch => use(reducer, dispatch);
  return reducer;
}

function forEachStore(stores, fn) {
  for (let item in stores) {
    if (stores[item]) {
      fn(stores[item]);
      if (stores[item].stores) {
        forEachStore(stores[item].stores, fn);
      }
    }
  }
}

function forEachAction(store, fn) {
  for (let item in store.handlers) {
    fn(store.handlers[item]);
  }
}

function use(store, dispatch) {
  const setDispatch = data => {
    data.action.setDispatch(dispatch);
  };
  forEachAction(store, setDispatch);
  forEachStore(store.stores, el => {
    forEachAction(el, setDispatch);
  });
}

export * from "./createAction";
