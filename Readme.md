# install

```
yarn add @kraken97/restate
```

[![Edit j2y6q5o8w5](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/j2y6q5o8w5)

[code example](https://github.com/zhDmitry/restate/blob/master/demo.md)


create state

```js
import React from "react";
import { render } from "react-dom";
import {
  createState,
  createActions,
  build,
  local,
  Consumer
} from "@kraken97/restate";

const actions = createActions({
  toggle: build.plain,
  inc: build.plain,
  text: build.plain,
  popup: build.mutator(false)
});

const toggle = createState(true);
const counter = createState(0);
counter.on(actions.inc, data => {
  return data + 1;
});
const text = createState("text");
text.on(actions.text, (data, payload) => {
  return payload;
});

const ui = createState({
  counter,
  text,
  opened: actions.popup /*make reducer that returns payload */
});

const rootState = createState({ toggle, ui });

const textState = ui.map((el, dispatch) => ({
  t: el.text,
  setText: e => dispatch(actions.text(e.target.value.replace(/\s/gi, "")))
})); // it will track only changes for text after few updates

const counterState = ui.map((state, dispatch) => {
  return {
    state: state.counter,
    inc: () => dispatch(actions.inc())
  };
});
const store = rootState.use(local);

store.dispatch({ type: "init" });
class App extends React.Component {
  render() {
    let counter1 = 0;
    let counter2 = 0;
    return (
      <div>
        <Consumer source={textState}>
          {data => {
            return (
              <div>
                render count{++counter1}
                <br />
                <input value={data.t} onChange={data.setText} />;
              </div>
            );
          }}
        </Consumer>
        <hr />
        <Consumer source={counterState}>
          {data => {
            console.log(data);
            return (
              <div>
                render count:{++counter2}
                <br />
                counter:{data.state}
                <button onClick={data.inc}>inc</button>
              </div>
            );
          }}
        </Consumer>
      </div>
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
