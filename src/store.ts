import React from "react";
import { get } from "lodash";
import { createSubscription } from "create-subscription";
import { getKeys, reducerPathSymbol } from "./createReducer";

function shallowEq(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== "object" || b === null || typeof a !== "object" || b === null) {
    return false;
  }
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(b, keysA[i]) ||
      !Object.is(a[keysA[i]], b[keysA[i]])
    ) {
      return false;
    }
  }
  return true;
}

let trackedFn;
export function checkKeyUsage(data, fn) {
  fn.deps = [];
  trackedFn = fn;
  const result = fn(data);
  trackedFn = null;
  const res = [result, fn.deps];
  fn.deps = null;
  return res;
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
export class Store {
  reactors = [];
  observers = [];
  selector;
  currentState;
  _consumer;

  getState = () => {
    return this.currentState;
  };

  subscribe = fn => {
    this.reactors.push(fn);
    return () => this.reactors.filter(el => !fn);
  };

  getConsumer = () => {
    if (!this._consumer) {
      this._consumer = createConsumer(this);
    }
    return this._consumer;
  };

  constructor(fn = identity) {
    this.selector = fn;
  }

  use = ({ subscribe, getState }) => {
    subscribe(() => {
      this.set(getState(), getKeys());
    });
  };
  addStore = store => {
    this.observers.push(store);
  };

  map = fn => {
    const store = new Store(fn);
    this.observers.push(store);
    return store;
  };
  set = (data, keys) => {
    wrapKeys(keys, data);

    let [computedData, deps] = checkKeyUsage(data, this.selector);
    const hasDeps = deps.length > 0;
    if (hasDeps || !shallowEq(this.getState(), computedData)) {
      this.currentState = computedData;
      this.reactors.forEach(fn => fn(computedData));
      this.observers.forEach(el => {
        el.set(computedData, keys);
      });
    }
  };

  callReactors = data => {
    this.reactors.forEach(fn => fn(this.selector(data)));
  };
}

function compose(...stores) {
  const store = new Store();
  function reactor() {
    store.callReactors(stores.map(el => el.getState()));
  }
  stores.forEach(el => {
    el.react(reactor);
  });

  return store;
}

export function createConsumer(store) {
  return class StoreConsumer extends React.Component {
    static displayName = `${store.displayName || "Store"}.Consumer`;

    state = { currentState: store.getState() };

    unsub;
    componentDidMount() {
      const unsub = store.subscribe(state => {
        if (state !== this.state.currentState) {
          // @ts-ignore
          this.setState(() => ({ currentState: state }));
        }
      });
      this.unsub = unsub;
    }
    componentWillUnmount() {
      this.unsub();
    }
    render() {
      // @ts-ignore
      return this.props.children(this.state.currentState);
    }
  };
}
