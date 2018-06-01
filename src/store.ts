import React from "react";
import { get, intersection, uniq, flatten, last } from "lodash";
import { shallowEquals } from "./shallowEquals";
import { ChangesTracker, getAllKeys, wrapKeys } from "./changesTracker";
import { LensCreator, makeLens } from "./lens";

export interface IStore<T> {
  map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}
const identity = d => d;

const dispatchCtx = Symbol("dispatchCtx");

const TYPES = {
  SINGLE_SHALLOW: 1,
  SINGLE_TRACK: 2,
  MULTI_TRACK: 3
};

function mergeKeys(data, store) {
  for (let action in store.handlers) {
    const actionInfo = store.handlers[action];
    const existingPaths = data[action];
    data[action] = existingPaths
      ? [...existingPaths, store.getPath().join(".")]
      : [store.getPath().join(".")];
    if (actionInfo && actionInfo.lens) {
      data[action].push(action => {
        return [...store.getPath(), ...actionInfo.lens(action, makeLens()).path].join(".");
      });
    }
  }
}
function forEachStore(stores, fn) {
  for (let item in stores) {
    if (stores[item]) {
      fn(stores[item]);
      if (stores[item].stores) {
        fn(stores[item].stores);
      }
    }
  }
}

function forEachAction(store, fn) {
  for (let item in store.handlers) {
    fn(store.handlers[item]);
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

  constructor(data, type = TYPES.SINGLE_SHALLOW) {
    this.type = type;
    // @ts-ignore
    this.compose = compose.bind(null, this);
    this.selector = data || identity;
    if (type === TYPES.SINGLE_TRACK) {
      this.changesTracker = new ChangesTracker();
    }
  }

  use(dataOrFn) {
    // @ts-ignore
    const origReducer = this.reducer;
    // @ts-ignore
    this.reducer = (state, action) => {
      const res = origReducer(state, action);
      // @ts-ignore
      this.changedAction = action;
      return res;
    };

    if (typeof dataOrFn === "function") {
      return dataOrFn(this);
    }
    const { subscribe, getState, dispatch } = dataOrFn;
    this.root = true;
    this.initialized = true;
    // this[ctxSymbol].context = context;
    //
    mergeKeys(this.keys, this);
    forEachAction(this, data => {
      data.action._dispatchers.add(dispatch);
    });
    // @ts-ignore
    forEachStore(this.stores, el => {
      // el[ctxSymbol] = this[ctxSymbol];
      mergeKeys(this.keys, el);

      forEachAction(el, data => {
        data.action._dispatchers.add(dispatch);
      });
      this.addStore(el);
      el.initialized = true;
    });
    // const getKeys = this[ctxSymbol].changesMonitor.getChangedKeys;

    const getKeys = (keys, action) => {
      if (!action || !action.type || !keys[action.type]) {
        return [];
      }
      return keys[action.type]
        .map(el => {
          if (typeof el === "function") {
            const res = el(action.payload);

            return res;
          }
          return el;
        })
        .filter(el => !!el);
    };
    subscribe(() => {
      // @ts-ignore
      this.set(getState(), getKeys(this.keys, this.changedAction));
    });
    dispatch({ type: "init" });
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
        computedData = this.changesTracker.compute(() => this.selector(data));
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
    // @ts-ignore
    if (stores.find(el => !el.computed)) {
      return;
    }
    // @ts-ignore
    store.set(stores.map(el => el.getState()), []);
  }
  stores.forEach(el => {
    // @ts-ignore
    el.subscribe(reactor);
  });
  return store;
}
