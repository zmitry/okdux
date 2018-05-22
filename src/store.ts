import React from "react";
import { get, intersection, uniq, flatten, last } from "lodash";
import { reducerPathSymbol, ctxSymbol } from "./createReducer";
import { shallowEquals } from "./shallowEquals";
import { ChangesTracker, getAllKeys, wrapKeys } from "./changesTracker";

export interface IStore<T> {
  map: <P>(fn: (data: T, ctx: any) => P) => IStore<P>;
  compute: <P, R extends { [F in keyof P]: <D>(arg: T) => D }, A, Rd = null>(
    data: R,
    mixin: (data: T) => Rd
  ) => IStore<{ [Z in keyof R]: ReturnType<R[Z]> } & Rd>;
}
const identity = d => d;

class Subscriber {
  reactors = [];
  observers = [];

  subscribe(fn) {
    this.reactors.push(fn);
    return () => this.reactors.filter(el => !fn);
  }

  notify(computedData, keys) {
    this.reactors.forEach(fn => fn(computedData));
    this.observers.forEach(el => {
      el.set(computedData, keys);
    });
  }
}

const SUBSCRIBE = 1;
const MAP = 2;
const COMPUTE = 3;

const graph = [];

const TYPES = {
  SINGLE_SHALLOW: 1,
  SINGLE_TRACK: 2,
  MULTI_TRACK: 3
};

export class MultiTrack {
  trackers = {};
  map;
  mix;
  keys;
  values = {};
  constructor({ map, mix = identity }) {
    this.map = map;
    this.mix = mix;
    Object.keys(map).forEach(el => {
      this.trackers[el] = new ChangesTracker();
    });
    this.keys = Object.keys(map);
  }
  public compute(data, changedKeys) {
    const res = this.keys.reduce((acc, el) => {
      const fn = this.map[el];
      if (this.trackers[el].hasChanges(changedKeys)) {
        const value = this.trackers[el].compute(() => fn(data, acc));
        acc[el] = value;
        this.values[el] = value;
      }
      return acc;
    }, Object.assign({}, this.values, this.mix(data)));
    return res;
  }
}

export class Store<T> implements IStore<T> {
  reactors = [];
  observers = [];
  selector;
  currentState;
  root = false;
  initialized = false;
  computed: MultiTrack;
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

    if (type === TYPES.MULTI_TRACK) {
      this.computed = new MultiTrack(data);
    } else if (type === TYPES.SINGLE_TRACK) {
      this.changesTracker = new ChangesTracker();
    } else {
      this.selector = data || identity;
    }
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
  }
  // @ts-ignore
  compute(map, mix) {
    const store = new Store({ map, mix }, TYPES.MULTI_TRACK);
    this.addStore(store);
    return store;
  }

  // @ts-ignore
  map(fn, shouldWatchNested) {
    const type = shouldWatchNested ? TYPES.SINGLE_TRACK : TYPES.SINGLE_SHALLOW;
    const store = new Store(fn, type);
    this.addStore(store);
    return store;
  }
  handleChanged(computedData, keys) {
    this.currentState = computedData;
    this.reactors.forEach(fn => fn(computedData));
    this.observers.forEach(el => {
      el.set(computedData, keys);
    });
  }

  run(data, keys, { context }) {
    let computedData;
    switch (this.type) {
      case TYPES.SINGLE_TRACK:
        computedData = this.changesTracker.compute(() => this.selector(data, context));
        if (!this.changesTracker.hasChanges(keys)) {
          return;
        }
        break;
      case TYPES.MULTI_TRACK:
        computedData = this.computed.compute(data, keys);
        break;
      default:
        computedData = this.selector(data, context);
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
    const context = this[ctxSymbol] && this[ctxSymbol].context;
    this.run(data, keys, { context });
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
