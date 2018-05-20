```jsx
import React from "react";
import { render } from "react-dom";
import { createAction, createState, Consumer } from "@kraken97/restate";
import { createStore } from "redux";

const toggleEvent = createAction("toggle");
const counterEvent = createAction("counter");
const intensiveCounter = createAction("icounter");
const toggle = createState(true);
const counter = createState(0);
const icounter = createState(0);

toggle.on(toggleEvent, (state, payload) => !state);
counter.on(counterEvent, state => state + 1);
icounter.on(intensiveCounter, state => state + 1);

const rootState = createState({ toggle, counter, icounter });

const toggleViewState = rootState
  .map((state, dispatch) => {
    return state.toggle;
  })
  .map(state => ({
    state,
    toggleEvent: s => dispatch(toggleEvent(s))
  }));

const store = createStore(rootState.buildReducer());
rootState.use({
  ...store,
  context: store.dispatch
});

dispatch = store.dispatch;

const computedCounter = counter.map((state, dispatch) => ({
  state: state,
  inc: () => dispatch(counterEvent())
}));
function Hello() {
  let renderCount = 0;
  let renderCount2 = 0;
  let renderCount3 = 0;

  let interval;
  return (
    <React.Fragment>
      <Consumer source={icounter}>
        {ctx => {
          return (
            <div>
              Intensive counter {ctx}
              <br />
              render count:{++renderCount3}
              <br />
              <button
                onClick={() => {
                  clearInterval(interval);
                  interval = setInterval(() => {
                    dispatch(intensiveCounter());
                  }, 100);
                }}
              >
                startDispatching
              </button>
              <button
                onClick={() => {
                  clearInterval(interval);
                }}
              >
                stop Dispatching
              </button>
            </div>
          );
        }}
      </Consumer>
      <hr />
      <Consumer source={computedCounter}>
        {ctx => {
          console.log(ctx);
          return (
            <div>
              render:
              {++renderCount2}
              <br />
              count: {ctx.state}
              <button onClick={ctx.inc}>inc</button>
            </div>
          );
        }}
      </Consumer>
      <hr />
      <Consumer source={toggleViewState}>
        {ctx => (
          <div>
            <button onClick={ctx.toggleEvent}>toggle</button>
            {" state: "}
            {JSON.stringify(ctx.state)}
            <br />
            {"render count: " + ++renderCount}
          </div>
        )}
      </Consumer>
    </React.Fragment>
  );
}

class App extends React.Component {
  componentWillMount() {
    dispatch({ type: "init" });
  }
  render() {
    return <Hello />;
  }
}

render(<App />, document.getElementById("root"));
```
