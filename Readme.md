# Okdux 👌

[![CircleCI](https://circleci.com/gh/zhDmitry/restate.svg?style=svg)](https://circleci.com/gh/zhDmitry/okdux)
[![NPM Downloads](https://img.shields.io/npm/dm/@kraken97/restate.svg?style=flat)](https://www.npmjs.com/package/okdux)

This lib was created for reducing pain from redux boilerplate.

---

## Installation

```bash
npm install --save okdux
```

or

```bash
yarn add okdux
```

## Usage

```js
import { createStore } from "redux";
import { connect } from "react-redux";


import { createActions, createState, build } from "okdux";


const actions = createActions({
  inc: build.action<string>()
});

const counterState = createState(0);
// different types of counters
const state = createState({ counter: countersState });

counterState.on(actions.inc, (state, p) => {
  return state + 1;
});

//[optional]auto bind all actions to redux
//store is redux store
state.createStore((reducer)=> createStore(reducer, {}));
// or
const store = createStore(state.reducer, {});
state.use(store.dispatch);

countersState.select(store.getState()); // will return state from root
countersState.select(store.getState()); // will return state from root

// select only counter from root state
// this component will be reuseable and you won't care about where your reducer are placed
// also you will get types suggestions
const enhancer = connect(countersState.select(counter=>({ counter })))


// dispatch actions
// all actions are autobinded to store after using .use action
// you can assign one action to multiple stores
// to access plain action call inc.raw();
// actions are autobinded in case of
inc(1);
inc(2);
inc(2);
inc(3);
inc(8);
```

## API

### `createDecorator: (...calculations: Calculation[]) => Decorator`

A function that takes a set of calculations and returns a 🏁 Final Form
[`Decorator`](https://github.com/final-form/final-form#decorator-form-formapi--unsubscribe).

## Types

### `createState({ //plain obj or different state }) => StateBuilder`

create state from plain object or compose from different state

```js
const counter = createState(0);

const state = createState({ counter });
```

ALERT: YOU CAN PASS to createState either plain obj or map of states

this is ok

```js
const counter = createState(0);
const counter2 = createState(0);

const state = createState({ counter, counter2 });
```

this is not ok

```js
const counter = createState(0);
const counter2 = createState(0);

const state = createState({ counter, counter2, name: "6" /* not ok*/ });
const state = createState({ counter, counter2, name: createState("name") }); // this is ok
```

### StateBuilder

### `StateBuilder.on(Action:Action, handler:(substate: any, ActionPayload)=>new substate)`

Add handler to substate
It's like building reducer but with using `.on` instead of switch cases
in handler as second argument you will get action payload and you have to return new state

### `StateBuilder.select(RootStateObject)=> state`

selects state related to your state builder

### `StateBuilder.select((subState)=>mappedState)=> mappedState`

state with map is equivalent to mapFn(StateBuilder.select({}));

it will return substate related to some stateBuilder
Example:

```js
// somewhere in state file;
const counterState = createState(0);

//somewhere in component
// now you can select your counter state and don't care about counter placement in store
const enhancer = connect(countersState.select(counter => ({ counter })));
```

ALERT: you can have only one stateBuilder mounded to root state

```js
const st = createState(2);
const rootSTate = createState({
  st,
  st2: st
}); // not ok
const makeSt = () => createState(2);
const rootSTate = createState({
  st: makeSt(),
  st2: makeSt()
}); // ok
```

### `StateBuilder.reducer: PlainReducer`

reducer property it's encapsulated reducer inside state builder

### `StateBuilder.use(dispatchFn): void`

makes all actions binded using `on` handler autobinded to this function
so you won't have to use mapDispatchToProps

### `StateBuilder.createState(createStoreFn): store`

same as use

example

```js
const state = createState(0);
state.createStore(reducer => createStore(reducer, {}));
// or simpler
state.createStore(createStore);
```

### `StateBuilder.reset(action): StateBuilder`

reset reducer value to default
same as `state.on(action, ()=>initialValue)`

### createActions({ [string]: ActionFactory })

example:s

```js
import { build } from 'okdux'
const actions = createActions({
  inc: build.action<string>()
})

actions.inc // actions creator

const state = createState(1);
state.on(inc, s=>s+1)
```
