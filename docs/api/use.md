# `state.use({ subscribe, getState, context })`

#### Arguments

1.  ({ subscribe, getState, context })

    * subscribe - just plain subscribe to some emitter, either redux.subscirbe or something else
    * getState - get current state for emitter
    * context - value to provide as second argument to all maps functions

Also use can accept function see example of usage in src/ministore.ts

#### Returns

it can return store but you shouldn't rely on this

#### Example

This example demonstrates how to use `use` method

```js
import React from 'react';
import { render } from 'react-dom';
import { createState, Consumer } from "@kraken97/restate";
import { createStore } from 'redux';

const counter = createState(0);

const reducer = counter.buildReducer();
const store = createStore(reducer);
counter.use({
  subscribe: store.subscribe
  getState: store.getState,
  context: store.dispatch
})


const counterWithDispatch = counter.map((c, dispatch)=>({ counter: c, dispatch  }))
class App extends React.Component {
  render() {
    return (
      <Consumer source={counter}>
        {({ dispatch, counter }) => {
          return <div>{counter}</div>;
        }}
      </Consumer>
    );
  }
}
render(<App />, document.getElementById("root"));
```

#### Tips
