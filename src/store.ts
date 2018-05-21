import React from "react";
import { get, intersection, uniq, flatten, last } from "lodash";
import { getKeys, reducerPathSymbol, ctxSymbol } from "./createReducer";
import { shallowEquals } from "./shallowEquals";

function transformKey(key) {
  return key.split(".").reduce((acc, el) => {
    return [...acc, acc.length > 0 ? [last(acc), el].join(".") : el];
  }, []);
}
let trackedFn;
export function checkKeyUsage(fn, data, context) {
  fn.deps = [];
  trackedFn = fn;
  const result = fn(data, context);
  walkThrowKeys(result);
  trackedFn = null;
  const deps = uniq(flatten(fn.deps.map(transformKey)));
  const res = [result, deps];
  fn.deps = null;
  return res;
}

function walkThrowKeys(data, key = null) {
  let keys = [];
  key && keys.push(key);
  if (Array.isArray(data)) {
    return keys;
  }

  if (typeof data === "object") {
    for (let i in data) {
      const res = walkThrowKeys(data[i], (key ? key + "." : "") + i);
      keys = keys.concat(res);
    }
  }
  return keys;
}

export function wrapKeys(keys, data) {
  for (let keyPath of keys) {
    const path = keyPath.split(".");
    // eslint-disable-next-line
    path.reduce((parent, prop) => {
      const obj = get(data, parent, data) || data;
      const valueProp = obj[prop];
      const pathToProp = [...parent, prop];
      if (typeof obj !== "object") {
        return pathToProp;
      }
      Reflect.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        get() {
          trackedFn && trackedFn.deps.push(pathToProp.join("."));
          return valueProp;
        }
      });
      return pathToProp;
    }, []);
  }
}

const identity = d => d;

export interface IStore<T> {
  map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}

export class Store<T> implements IStore<T> {
  reactors = [];
  observers = [];
  selector;
  currentState;
  root = false;
  deps = [];
  initialized = false;
  watchNested;

  getState() {
    return this.currentState;
  }

  subscribe(fn) {
    // if (!this.initialized) {
    //   this.use(local);
    // }

    this.reactors.push(fn);
    return () => this.reactors.filter(el => !fn);
  }

  constructor(fn = identity, watchNested) {
    this.selector = fn;
    this.watchNested = watchNested;
  }

  forEach(fn) {
    this.observers.forEach(el => {
      fn(el);
      el.forEach(fn);
    });
  }
  use(dataOrFn) {
    if (typeof dataOrFn === "function") {
      return dataOrFn(this);
    }
    const { subscribe, getState, context } = dataOrFn;
    this.root = true;
    this.initialized = true;
    this[ctxSymbol].context = context;
    this.forEach(el => {
      el[ctxSymbol] = this[ctxSymbol];
      el.initialized = true;
    });
    const getKeys = this[ctxSymbol].changesMonitor.getChangedKeys;
    subscribe(() => {
      this.set(getState(), getKeys());
    });
    return dataOrFn;
  }
  addStore(store) {
    this.observers.push(store);
    return store;
  }
  // @ts-ignore
  map(fn, shouldWatchNested) {
    const store = new Store(fn, shouldWatchNested);
    return this.addStore(store);
  }
  set(data, keys) {
    if (this.root) {
      keys = this.getState() ? keys : walkThrowKeys(data);
      wrapKeys(keys, data);
    }
    const context = this[ctxSymbol] && this[ctxSymbol].context;
    const state = this.getState();
    let computedData;
    // @ts-ignore
    if (this.watchNested) {
      let [cmpData, deps] = checkKeyUsage(this.selector, data, context);
      computedData = cmpData;
      this.deps = uniq([...this.deps, ...deps]);
      if (this.deps.length > 0 && intersection(this.deps, keys).length === 0) {
        return;
      }
    } else {
      computedData = this.selector(data);
    }
    if (!shallowEquals(state, computedData)) {
      this.currentState = computedData;
      this.reactors.forEach(fn => fn(computedData));
      this.observers.forEach(el => {
        el.set(computedData, keys);
      });
    }
  }
}

// function compose(...stores) {
//   const store = new Store();
//   function reactor() {
//     store.callReactors(stores.map(el => el.getState()));
//   }
//   stores.forEach(el => {
//     el.react(reactor);
//   });

//   return store;
// }
