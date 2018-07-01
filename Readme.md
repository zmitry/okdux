# Restate

[![CircleCI](https://circleci.com/gh/zhDmitry/restate.svg?style=svg)](https://circleci.com/gh/zhDmitry/restate)

## Into

This lib was created for reducing pain from redux boilerplaite.

1.  remove reducers and actions creators boilerplate
2.  remove boilerplate from binding actions, all actions are autbinded to their scope
3.  remove boilerplate from selecting hight level state, now to can use .select method on every reducer to select his state
4.  more sophisticated way for computed values which works without memoization (like mobx but more performat and without wrapping all the state into getters)
5.  more easier way for nested updates
6.  strictly typed and good test coverage

## install

```
yarn add @kraken97/restate
```

## how to use

doc soon
see [tree view example from redux](https://github.com/zhDmitry/restate/tree/master/examples/tree/src)

[![Play kxr5vy1x6v](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/kxr5vy1x6v)

```js
import { createAction, createState, createComputed } from "@kraken97/restate";
const inc = createAction("Increment counters");
// different types of counters
const state = createState({ counters: [0, 0, 0, 0] });
state.on(
  inc,
  (counterIndex, prop) => prop.key("counters").index(counterIndex),
  (state, p) => {
    // updating nested data
    return state + 1;
  }
);

// connect store to event sources in this example to basic redux
const store = state.use(local);

// compute data from our store
// it will recompute our value only when data changes
const computed = createComputed(state, data => ({ data: data }));

computed.connect(d => ({ ...d }))(data => <div>{data}</div>);
// dispatch actions
// all actions are autobinded to store after using .use action
// you can assign one action to multiple stores
// to access plain action call inc.raw();
inc(1);
inc(2);
inc(2);
inc(3);
inc(8);
```

## test coverage

```
-------------------|----------|----------|----------|----------|-------------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------|----------|----------|----------|----------|-------------------|
All files          |    93.02 |    86.11 |    87.37 |    93.08 |                   |
-------------------|----------|----------|----------|----------|-------------------|
```

## todo

1.  improve types
2.  extend api with (comparators and computed see rfc.md)
3.  improve tests
4.  think about async actions
