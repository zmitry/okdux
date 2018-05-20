# install

```
yarn add stateducer
```

create state

```js
import { createState, createActions, build, local, Consumer } from "@kraken97/restate";

const actions = createActions({
  toggle: build.plain,
  inc: build.plain,
  text: build.plain,
  popup: build.mutator(false)
});

const toggle = createState(true);
const counter = createState(0);
const text = createState("");
text.on(actions, (data, payload) => {
  return payload;
});

const ui = createState({
  counter,
  text,
  opened: actions.popup /*make reducer that returns payload */
});

const rootState = createState({ toggle, ui });
rootState.use(local);

const textState = ui.map((el, dispatch) => ({
  t: el.text,
  setText: text => dispatch(actions.text(text + ".jpg"))
})); // it will track only changes for text

class List extends React.Component {
  render() {
    return (
      <Consumer source={textState}>
        {data => {
          return <div>{data}</div>;
        }}
      </Consumer>
    );
  }
}
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
