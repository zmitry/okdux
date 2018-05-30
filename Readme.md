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

[![Play kxr5vy1x6v](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/kxr5vy1x6v)

```js
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
const computed = state.map(el => ({ very: { nested: { object: el.data[1] } } }), true);

// will be called only once
computed.subscribe(data => {
  console.log("data changed", data);
});

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

```js
import React from "react";
import { render } from "react-dom";
import { createState, createActions, build, local, Consumer } from "@kraken97/restate";

const actions = createActions({
  setText: build.plain,
});

const text = createState("text");
text.on(actions.text, (data, payload) => {
  return payload;
});


// you can use plain redux with this lib
// go to ministore.ts file
const store = text.use(local);

store.dispatch({ type: "init" });

class App extends React.Component {
  render() {
    return (
        <Consumer source={textState}>
          {data => {
            return (
                <input value={data.t} onChange={e => actions.setText(e.target.value)} />;
            );
          }}
        </Consumer>
    );
  }
}

render(<App />, document.getElementById("root"));
```

## benchmarks

```
* just mutate [FLOOR]
  create: 26 ms
  update: 343 μs
  heap:
    total 1.5 Mb
    used  17.3 Mb
  rss: 1.8 Mb

* immutableJS
  create: 255 ms
  update: 35 ms
  heap:
    total 93.3 Mb
    used  72.4 Mb
  rss: 102.6 Mb

* immer (proxy) - without autofreeze
  create: 22 ms
  update: 59 ms
  heap:
    total 21.2 Mb
    used  23.9 Mb
  rss: 20.2 Mb

* mobx
  create: 2.75 s
  update: 38 ms
  heap:
    total 147.3 Mb
    used  147.9 Mb
  rss: 147.3 Mb

* restate x
  create: 76 ms
  update: 12 ms
  heap:
    total 16.4 Mb
    used  26.4 Mb
  rss: 16.5 Mb

* proxy
  create:
  update: 663 h
  heap:
    total 44.5 Mb
    used  50.6 Mb
  rss: 43.0 Mb

* redux
  create: 27 ms
  update: 11 ms
  heap:
    total 3.2 Mb
    used  22.0 Mb
  rss: 1.4 Mb

dmitry at Dmitrys-MacBook-Pro in ~/P/c/k/p/restatex (master↑2|✚1)
» npm run bench

> @kraken97/restate@1.0.7 bench /Users/dmitry/Projects/cyberhaven/kibana-plugins/packages/restatex
> node --experimental-modules --expose-gc bench/bench.js

(node:91274) ExperimentalWarning: The ESM module loader is experimental.
* just mutate [FLOOR]
  create: 29 ms
  update: 374 μs
  heap:
    total 1.5 Mb
    used  17.3 Mb
  rss: 1.5 Mb

* immutableJS
  create: 258 ms
  update: 33 ms
  heap:
    total 92.3 Mb
    used  72.8 Mb
  rss: 101.9 Mb

* immer (proxy) - without autofreeze
  create: 19 ms
  update: 54 ms
  heap:
    total 20.7 Mb
    used  23.8 Mb
  rss: 20.0 Mb

* mobx
  create: 2.79 s
  update: 36 ms
  heap:
    total 145.2 Mb
    used  148.9 Mb
  rss: 145.8 Mb

* restate x
  create: 74 ms
  update: 12 ms
  heap:
    total 16.9 Mb
    used  26.3 Mb
  rss: 18.6 Mb

* proxy
  create:
  update: 663 h
  heap:
    total 44.5 Mb
    used  50.5 Mb
  rss: 43.3 Mb

* redux
  create: 28 ms
  update: 10 ms
  heap:
    total 3.2 Mb
    used  22.0 Mb
  rss: 1.6 Mb
```

## test coverage

```
-------------------|----------|----------|----------|----------|-------------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------|----------|----------|----------|----------|-------------------|
All files          |    93.02 |    86.11 |    87.37 |    93.08 |                   |
-------------------|----------|----------|----------|----------|-------------------|
```
