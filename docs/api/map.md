# `state.map(fn, watchNested)`

created derivation from state, and will recompute it on every state changes uses shallow compare for change tracking and property access in some cases

#### Arguments

1.  (fn: (data, context)=>newData): function for transform, have data of the state as first argument and context provided by use function as second. This function should be pure and return state.
2.  watchNested - prop for watching nested properties, which cannot be correctly tracked using shallow compare

#### Returns

(Derivation): Returns new derivation on which you can compute new state;

#### Example

This example demonstrates how to use map and how watch nested works

```js
import { createAction, createState, local } from "@kraken97/restate";

const toggleEvent = createAction("toggle");
const counterEvent = createAction("counter");
const toggle = createState(true);
const counter = createState(0);

toggle.on(toggleEvent, (state, payload) => !state);
counter.on(counterEvent, state => state + 1);
const rootState = createState({ toggle, counter });
const reducer = rootState.buildReducer();
const store = createStore(reducer);

const toggleViewState = rootState
  .map(state => {
    return {
      toggle: { a: { c: state.toggle } }
    };
  }) // if we send true as second argument to map subscriber will update on every action
  .map(el => ({
    state: el,
    toggleEvent: e => dispatch(toggleEvent(e))
  }));
rootState.use(local);

toggleViewState.subscribe(() => console.log("call toggleViewState")); // this will be triggered 2 times
counter.subscribe(() => console.log("call counter")); // this will be triggered 4 times

store.dispatch({ type: "init" }); // initial action to trigger all subscribers

// store.dispatch(toggleEvent());
// store.dispatch(toggleEvent());
store.dispatch(toggleEvent());
store.dispatch(counterEvent());
store.dispatch(counterEvent());
store.dispatch(counterEvent());
```

#### Tips

* map uses shallow compare for updates, so if you need prevent updates for some propery you can write just .map(el=> el.data);
* tracking nested properties can cause issues in case if you don't access any of properties

```js
map(data => ({ data, a: data.text })); // in this case you will track only text updates, not all the data properties
```
