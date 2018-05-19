import React from "react";
import { get } from "lodash";
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
  reactors = new Set();
  observers = [];
  selector;
  currentValue;

  constructor(fn = identity) {
    this.selector = fn;
  }

  use = ({ subscribe, getState }) => {
    subscribe(() => {
      this.set(getState(), getKeys());
    });
  };

  react = fn => {
    this.reactors.add(fn);
    return () => this.reactors.filters(el => !fn);
  };

  map = fn => {
    const store = new Store(fn);
    this.observers.push(store);
    return store;
  };
  set = (data, keys) => {
    if (this[reducerPathSymbol]) {
      wrapKeys(keys, data);
    }
    let [computedData, deps] = checkKeyUsage(data, this.selector);
    const hasDeps = deps.length > 0;
    if (hasDeps || !shallowEq(this.value, computedData)) {
      this.value = computedData;
      this.reactors.forEach(fn => fn(computedData));
      this.observers.forEach(el => {
        el.set(computedData, keys);
      });
    }
  };

  getValue() {
    return this.currentValue;
  }

  callReactors(data) {
    const computedData = this.selector(data);
    this.reactors.forEach(fn => fn(computedData));
  }

  tree() {
    return {
      value: this.currentValue,
      children: this.observers.map(el => el.tree())
    };
  }
}

function compose(...stores) {
  const store = new Store();
  function reactor() {
    store.callReactors(stores.map(el => el.getValue()));
  }
  stores.forEach(el => {
    el.react(reactor);
  });

  return store;
}

// const policiesStore = new Store(
//   { policies: { ui: { searchText: "qewr", counter: 0 } }, machines: [] },
//   data => data.policies
// );

// const searchText = policiesStore
//   .map(policies => policies.ui)
//   .map(el => el.searchText);
// const counter = policiesStore
//   .map(policies => policies.ui)
//   .map(el => el.counter);

// const composed = compose(searchText, counter);

// composed.react(data => {
//   console.log("composed", data);
// });
// counter.react(el => console.log("counter", el));

// searchText.react(data => {
//   console.log(data);
// });

// policiesStore.set(
//   { policies: { ui: { searchText: "qewr" } }, machines: [] },
//   new Set(["policies.ui.searchText"])
// );

// let i = 0;
// setInterval(() => {
//   policiesStore.set(
//     { policies: { ui: { searchText: "qewr", counter: ++i } }, machines: [] },
//     new Set(["policies.ui.counter"])
//   );
// }, 6000);

export function createConsumer(store) {
  return class Consumer extends React.Component {
    state = {};
    componentWillMount() {
      this.unsub = store.react(el => {
        this.setState({ state: el });
      });
    }
    componentWillUnount() {
      this.unsub();
    }
    render() {
      return this.props.children(this.state.state);
    }
  };
}

function Consumer({ source }) {
  return createSubscribtion({
    getValue: source.getValue,
    subscribe: source.react
  });
}
export const middleware = (store, getKeys) => ({ dispatch, getState }) => next => action => {
  next(action);
  store.set(getState(), getKeys());
};
// console.log("policiesStore: ", policiesStore.tree());
