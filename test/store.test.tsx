import React from "react";
import { createStore } from "redux";
import { Store, compose } from "../src/store";
import { ChangesTracker, checkKeyUsage, wrapKeys, getAllKeys } from "../src/changesTracker";
import { createState, createAction, Consumer, local, StandardAction } from "../src";
import Render from "react-test-renderer";
let mockedData;
let changedKeys;
beforeAll(() => {
  mockedData = {
    ui: { a: { b: 5 } },
    users: { password: { hash: "", data: "" }, name: "" },
    ke: { a: 5 },
    d: 6
  };

  changedKeys = ["ui.a", "users"];
});
describe("restate", () => {
  it("getAllKeys works correctly", () => {
    const keys = getAllKeys(mockedData);
    expect(keys).toMatchSnapshot("getAllKeys");
  });
  it("changesTracker checks correct deps and track changes correctly", () => {
    wrapKeys(getAllKeys(mockedData), mockedData);
    const changesTracker = new ChangesTracker();

    changesTracker.compute(() => {
      return [mockedData.ui.a, mockedData.users.name];
    });

    changesTracker.compute(() => {
      let users = mockedData.users;
      return [mockedData.ui.a, users, mockedData.users.name];
    });

    expect(changesTracker.trackedDependencies).toEqual(["ui", "ui.a", "users", "users.name"]);
    expect(changesTracker.nestedTrackedDependencies).toEqual(["ui.a", "users"]);

    expect(changesTracker.hasChanges(["ui"])).toBeTruthy();
    expect(changesTracker.hasChanges(["ui.a.qwer"])).toBeTruthy();
    expect(changesTracker.hasChanges(["users"])).toBeTruthy();
    expect(changesTracker.hasChanges(["users.kek"])).toBeTruthy();
    expect(changesTracker.hasChanges(["otherkey"])).toBeFalsy();
    expect(changesTracker.hasChanges(["ui.data"])).toBeFalsy();
    changesTracker.clearObservedKeys();
    expect(changesTracker.trackedDependencies).toEqual([]);
    expect(changesTracker.nestedTrackedDependencies).toEqual([]);
  });
  it("calculates computed", () => {
    const inc = createAction("inc");
    const set = createAction("text");

    const counter = createState(1);
    counter.on(inc, state => state + 1);
    const text = createState("hello");
    text.on(set, (data, ev) => data + ev);
    const root = createState({ text, counter });
    const computedValue = counter.map(data => Math.random() >= 0.5);
    const computedValue2 = computedValue.compose(text, data => {
      return { a: [data[0]] };
    });
    const store = root.use(local);
    store.dispatch(inc());

    computedValue.subscribe(el => {});
    computedValue2.subscribe(el => {});

    for (let i = 0; i < 8; i++) {
      store.dispatch(inc());
    }
  });

  it("works ok with store", () => {
    const store = new Store();
    const newData = { ui: { a: "5" }, users: { password: "5dsf", name: "qwer" } };
    const cb = jest.fn();
    const computedStore = store.map(data => ({ ui: data.ui.a, password: data.users.password }));
    computedStore.subscribe(cb);

    store.set(newData, ["ui.a", "users.password"]);
    expect(cb.mock.calls[0][0]).toEqual({ ui: "5", password: "5dsf" });
    store.set({ ...newData, ui: { a: "6" } }, ["users.password"]);
    store.set({ ...newData, ui: { a: "7" } }, ["ui.a"]);

    expect(cb.mock.calls.length).toEqual(3);
  });

  it("works ok with reducer", () => {
    const toggleEvent = createAction("toggle");
    const toggle = createState(0);
    const toggle2 = createState("a");

    toggle.on(toggleEvent, (state, payload) => state + 1);

    const rootState = createState({ toggle, toggle2 });

    const reducer = rootState.reducer;
    const store = createStore(reducer);

    rootState.use(store);
    // expect(rootState.observers.length).toBe(2);

    store.dispatch({ type: "" });
    toggleEvent();
    const renderer = Render.create(
      <Consumer source={toggle}>
        {data => {
          expect(data).toEqual(toggle.getState());
          return <div>{JSON.stringify(data)}</div>;
        }}
      </Consumer>
    );

    const renderer2 = Render.create(
      <Consumer
        source={toggle}
        selector={data => {
          return data + 1;
        }}
      >
        {data => {
          expect(data).toEqual(2);
          return <div>{JSON.stringify(data)}</div>;
        }}
      </Consumer>
    );
  });

  it("rerender only needed times", () => {
    const toggleEvent = createAction("toggle");
    const counterEvent = createAction("counter");
    const toggle = createState(true);
    const counter = createState(0);
    toggle.on(toggleEvent, (state, payload) => !state);
    counter.on(counterEvent, state => state + 1);
    const rootState = createState({ toggle, counter });
    const reducer = rootState.reducer;
    const store = createStore(reducer);

    const toggleViewState = rootState
      .map(state => {
        return {
          toggle: { a: { c: state.toggle } }
        };
      })
      .map(
        el => (
          {
            state: el,
            toggleEvent: e => dispatch(toggleEvent(e))
          },
          true
        )
      );
    rootState.use(store);

    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();
    rootState.map(fn3);

    toggleViewState.subscribe(fn1);
    counter.map(el => el).subscribe(fn2);

    store.dispatch({ type: "init" });

    // store.dispatch(toggleEvent());
    // store.dispatch(toggleEvent());
    toggleEvent();
    counterEvent();
    counterEvent();
    counterEvent();
    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(4);
    expect(fn2.mock.calls).toMatchSnapshot();
    expect(fn1.mock.calls).toMatchSnapshot();
  });

  it("works ok with ministore", () => {
    const e = createAction("e");
    const state = createState("a");
    state.on(e, state => state + 1);
    const fn = jest.fn();

    state.map(fn);

    const e2 = createAction("a");
    const state2 = createState("b");

    state2.on(e2, (_, p) => p);
    const common = createState({ state, state2 });

    state2.subscribe(data => {});
    state.subscribe(() => {});
    const st = common.use(local);

    st.dispatch(e());
    st.dispatch(e2(1));
    st.dispatch(e2(5));

    expect(fn.mock.calls[0][0]).toEqual("a1");
  });

  it("works with lenses", () => {
    const toggle: StandardAction<number> = createAction("TOGGLE");
    const state = createState({ data: [{ id: 1 }, { id: 2, title: "qwer" }], kek: " 5" });
    state.on(
      toggle,
      (payload, prop) => prop.key("data").index(payload),
      (state, p) => {
        return { ...state, title: "qqq" };
      }
    );

    const store = state.use(local);
    const computed = state.map(el => ({ very: { nested: { object: el.data[1] } } }), true);
    const fn = jest.fn();
    computed.subscribe(fn);
    toggle(1);
    toggle(2);
    toggle(2);
    toggle(3);
    toggle(8);

    const reducer = state.reducer;
    expect(reducer(undefined, toggle.raw(1))).toEqual({
      data: [{ id: 1 }, { id: 2, title: "qqq" }],
      kek: " 5"
    });
    expect(fn.mock.calls.length).toBe(1);
  });

  it("works with action binding", () => {
    const toggle: StandardAction<number> = createAction("TOGGLE");
    const state = createState(0);
    state.on(toggle, state => {
      return state + 1;
    });
    const store = state.use(local);
    toggle(1);
    expect([...toggle._dispatchers].length).toBe(1);
  });

  it("composes state with actions corrctly", () => {
    const toggle: StandardAction<number> = createAction("TOGGLE");
    const state = createState(0);
    let composed = createState({
      toggle,
      state
    });
    expect(composed.reducer()).toEqual({ toggle: null, state: 0 });
    composed = createState({
      state,
      toggle
    });
    composed = createState({
      toggle
    });
    expect(composed.reducer()).toEqual({ toggle: null });

    composed = createState({
      data: 2
    });
    expect(composed.reducer()).toEqual({ data: 2 });
  });
});
