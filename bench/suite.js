const { createAction, createState, local } = require("../");
const { generateDraft } = require("./mock");
const { observable } = require("mobx");
const { createStore, combineReducers } = require("redux");
const { createStore: efStore, createEvent: efAction } = require("effector");

const MAX = 1000;
const MODIFY_FACTOR = 0.5;

const reducer = (draft = generateDraft()) => {
  const newDraft = draft.concat([]);
  for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
    newDraft[i] = Object.assign({}, newDraft[i], { done: Math.random() });
  }
  return newDraft;
};

suite("restate", function() {
  bench("create", function() {
    const toggle = createAction("");
    const state = createState(generateDraft());
    state.on(toggle, (_, p) => p);
    state.use(local);
  });

  const toggle = createAction("");
  const state = createState(generateDraft());
  state.on(toggle, reducer);
  state.use(local);

  bench("modify", function() {
    state.subscribe(e => e);
    toggle();
  });
});

function makeRecReducer(i) {
  if (i === 20) {
    return (d = 2) => 2;
  }
  return combineReducers({
    [i]: makeRecReducer(i + 1)
  });
}
suite("redux", function() {
  bench("create", function() {
    const store = createStore((d = null) => d, generateDraft());
    store.dispatch({ type: "any" });
  });

  const reducerMap = {};
  for (let i = 0; i < 300; i++) {
    reducerMap[i] = (d = 4) => 2;
  }
  const rootReducer = combineReducers({
    a: combineReducers({
      b: combineReducers({
        c: combineReducers(reducerMap)
      })
    })
  });
  let store;

  bench("modify complex reducer", function() {
    store = createStore(rootReducer);
    store.subscribe(() => {});
    store.dispatch({ type: "init" });
  });

  bench("modify complex reducer rec", function() {
    store = createStore(makeRecReducer(0));
    store.subscribe(() => {});
    store.dispatch({ type: "init" });
  });

  bench("modify simple", function() {
    store = createStore((d = 2) => 2);
    store.subscribe(() => {});
    store.dispatch({ type: "init" });
  });
});

suite("mobx", function() {
  bench("create", function() {
    const data = observable.array(generateDraft());
  });

  bench("shallow wrap", function() {
    const data = observable.array(generateDraft(), { deep: false });
  });
  const data = observable(generateDraft());

  bench("modify", function() {
    const mutate = draft => {
      for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
        draft[i].done = Math.random();
      }
    };
    mutate(data);
  });
});

suite("effector", function() {
  bench("create", function() {
    const toggle = efAction("");
    const state = efStore(generateDraft());
    state.on(toggle, (_, p) => p);
  });

  const toggle = efAction("");
  const state = efStore(generateDraft());
  state.on(toggle, reducer);

  bench("modify", function() {
    toggle();
  });
});
