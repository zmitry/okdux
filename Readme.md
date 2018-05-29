# install

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

# benchmarks

```
immutableJS
  create: 291 ms
  update: 46 ms
  heap:
    total 97.5 Mb
    used  77.7 Mb

* immer (proxy) - without autofreeze
  create: 20 ms
  update: 85 ms
  heap:
    total 13.0 Mb
    used  23.5 Mb

* restate x
  create: 64 ms
  update: 12 ms
  heap:
    total 4.5 Mb
    used  24.5 Mb
```
