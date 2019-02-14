import {
  IReducerBuilder,
  CombinedReducer,
  BaseReducerBuilder,
  R,
  getRootStateSymbol
} from "./state";
import { create } from "domain";

export function createState<T>(initialState: T): IReducerBuilder<R<T>> {
  if (initialState === undefined) {
    throw new Error("initial state cannot be undefined");
  }
  let state;
  if (initialState && typeof initialState === "object") {
    const firstKey = Object.keys(initialState)[0];
    if (
      initialState[firstKey] &&
      (initialState[firstKey].reducer ||
        initialState[firstKey].getType ||
        typeof initialState[firstKey] === "function")
    ) {
      // @ts-ignore
      state = new CombinedReducer(initialState);
    } else {
      state = new BaseReducerBuilder(initialState);
    }
  } else {
    state = new BaseReducerBuilder(initialState);
  }

  state.use = (d, gs) => use(state, d, gs);
  state.createStore = fn => {
    const store = fn(state.reducer, state);
    if (!store) {
      throw new Error("you must return store from createStore method");
    }
    use(state, store.dispatch);
  };

  return state;
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
  for (let item of Object.getOwnPropertySymbols(store.handlers)) {
    fn(store.handlers[item]);
  }
}

function use(store, dispatch, getState = null) {
  const setDispatch = data => {
    data.action.setDispatch(dispatch);
  };
  forEachAction(store, setDispatch);
  store[getRootStateSymbol] = getState;
  forEachStore(store.stores, el => {
    el[getRootStateSymbol] = getState;
    forEachAction(el, setDispatch);
  });
}

export * from "./action";
export * from "./state/reducer.h";
