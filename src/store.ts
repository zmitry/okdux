import React from "react";
import { get, intersection, uniq, flatten, last } from "lodash";
import { reducerPathSymbol, ctxSymbol } from "./createReducer";
import { shallowEquals } from "./shallowEquals";
import { ChangesTracker, getAllKeys, wrapKeys } from "./changesTracker";

export interface IStore<T> {
  map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}
const identity = d => d;

const TYPES = {
  SINGLE_SHALLOW: 1,
  SINGLE_TRACK: 2,
  MULTI_TRACK: 3
};

function mergeKeys(data, store) {
  for (let action in store.handlers) {
    const existingPath = data[action];
    data[action] = existingPath
      ? [...existingPath, store.getPath().join(".")]
      : [store.getPath().join(".")];
  }
}

export class Store<T> implements IStore<T> {
  reactors = [];
  observers = [];
  keys = {};
  selector;
  currentState;
  root = false;
  initialized = false;
  computed = false;
  type = TYPES.SINGLE_SHALLOW;
  changesTracker: ChangesTracker;

  getState() {
    return this.currentState;
  }

  subscribe(fn) {
    this.reactors.push(fn);
    return () => this.reactors.filter(el => !fn);
  }

  constructor(data, type) {
    this.type = type;
    this.compose = compose.bind(null, this);
    this.selector = data || identity;
    if (type === TYPES.SINGLE_TRACK) {
      this.changesTracker = new ChangesTracker();
    }
  }

  forEach(stores, fn) {
    for (let item in stores) {
      if (stores[item]) {
        fn(stores[item]);
        if (stores[item].stores) {
          fn(stores[item].stores);
        }
      }
    }
  }
  use(dataOrFn) {
    const origReducer = this.reducer;
    this.reducer = (state, action) => {
      const res = origReducer(state, action);
      this.changedAction = action;
      return res;
    };

    if (typeof dataOrFn === "function") {
      return dataOrFn(this);
    }
    const { subscribe, getState, context } = dataOrFn;
    this.root = true;
    this.initialized = true;
    // this[ctxSymbol].context = context;
    // console.log(this);
    this.forEach(this.stores, el => {
      // el[ctxSymbol] = this[ctxSymbol];
      mergeKeys(this.keys, el);
      this.addStore(el);
      el.initialized = true;
    });
    // const getKeys = this[ctxSymbol].changesMonitor.getChangedKeys;

    const getKeys = (keys, action) => {
      // console.log("action: ", action);
      return action && action.type ? keys[action.type] : [];
    };
    subscribe(() => {
      this.set(getState(), getKeys(this.keys, this.changedAction));
    });
    return dataOrFn;
  }
  addStore(store) {
    this.observers.push(store);
  }

  // @ts-ignore
  map(fn, shouldWatchNested) {
    const type = shouldWatchNested ? TYPES.SINGLE_TRACK : TYPES.SINGLE_SHALLOW;
    const store = new Store(fn, type);
    this.addStore(store);
    return store;
  }

  handleChanged(computedData, keys) {
    this.computed = true;
    this.currentState = computedData;
    this.observers.forEach(el => el.run(computedData, keys));
    this.reactors.forEach(fn => fn(computedData));
  }

  run(data, keys) {
    let computedData;
    switch (this.type) {
      case TYPES.SINGLE_TRACK:
        computedData = this.changesTracker.compute(() => this.selector(data, null));
        if (!this.changesTracker.hasChanges(keys)) {
          return;
        }
        break;
      default:
        computedData = this.selector(data, null);
        break;
    }
    if (shallowEquals(this.getState(), computedData)) {
      return;
    }
    this.handleChanged(computedData, keys);
  }

  set(data, keys) {
    console.log(data);

    if (this.root) {
      keys = this.getState() ? keys : getAllKeys(data);
      wrapKeys(keys, data);
    }
    this.run(data, keys);
  }
}

export function compose(...stores: IStore<any>[]) {
  const fn: any = stores.pop();
  const store = new Store(fn, TYPES.SINGLE_TRACK);
  function reactor() {
    if (stores.find(el => !el.computed)) {
      return;
    }
    store.set(stores.map(el => el.getState()), []);
  }
  stores.forEach(el => {
    el.subscribe(reactor);
  });
  return store;
}
