import React from "react";
import { get, intersection, uniq, flatten, last } from "lodash";
import { getKeys, reducerPathSymbol, ctxSymbol } from "./createReducer";
import { shallowEquals } from "./shallowEquals";
import { ChangesTracker, getAllKeys, wrapKeys } from "./changesTracker";

export interface IStore<T> {
  map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
}
const identity = d => d;

export class Store<T> implements IStore<T> {
  reactors = [];
  observers = [];
  selector;
  currentState;
  root = false;
  initialized = false;
  watchNested;
  changesTracker: ChangesTracker;

  getState() {
    return this.currentState;
  }

  subscribe(fn) {
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
      keys = this.getState() ? keys : getAllKeys(data);
      wrapKeys(keys, data);
    }
    const context = this[ctxSymbol] && this[ctxSymbol].context;
    const state = this.getState();
    let computedData;
    // @ts-ignore
    if (this.watchNested) {
      if (!this.changesTracker) {
        this.changesTracker = new ChangesTracker();
      }
      const fn = () => this.selector(data, context);

      computedData = this.changesTracker.compute(fn);
      if (!this.changesTracker.hasChanges(keys)) {
        return;
      }
    } else {
      computedData = this.selector(data, context);
    }
    if (!shallowEquals(state, computedData)) {
      // this.currentState = computedData;
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
