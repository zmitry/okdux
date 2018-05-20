# `state.buildReducer(path?)`

#### Arguments

1.  (path) - accepts path for reducer in global state, can be optional

#### Returns

returns simple root reducer for all nested state

#### Example

This example demonstrates how to use `use` method

```js
import React from "react";
import { render } from "react-dom";
import { createState, Consumer, createAction } from "@kraken97/restate";
import { createStore } from "redux";

const action = createAction("inc");
const counter = createState(0);
counter.on(action, (state, payload) => {
  return state + 1;
});

const reducer = counter.buildReducer();
const res = reducer(0, action()); // res will be 1;
const store = createStore(reducer);
```

```js
import React from "react";
import { render } from "react-dom";
import { createState, Consumer, createAction } from "@kraken97/restate";
import { createStore, combineReducers } from "redux";

const action = createAction("inc");
const counter = createState(0);
counter.on(action, (state, payload) => {
  return state + 1;
});

const reducer = combineReducers({
  counter: counter.buildReducer("counter");
  user: ()=>({})
})
const store = createStore(reducer);
```

#### Tips
