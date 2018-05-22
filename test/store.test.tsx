import React from "react";
import { createStore } from "redux";
import { Store } from "../src/store";
import { ChangesTracker, checkKeyUsage, wrapKeys, getAllKeys } from "../src/changesTracker";
import { createState, createAction, Consumer, local } from "../src";
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
    const store = root.use(local);
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    const compute1 = data => {
      fn1(data);
      return data.text + data.counter;
    };
    const compute2 = data => {
      fn2(data);
      return data.text + Math.random();
    };

    const computation = root.compute({
      msg: compute1,
      msg2: compute2
    });
    const clear = () => {
      fn1.mockClear();
      fn2.mockClear();
    };
    const subs = jest.fn();
    computation
      .map(el => {
        return el.msg2;
      })
      .subscribe(el => console.log("cmp", el));
    computation.subscribe(subs);
    store.dispatch(inc());
    expect(fn1).toBeCalled();
    expect(fn2.mock.calls.length).toBe(1);
    clear();
    store.dispatch(inc());
    expect(fn1).toBeCalled();
    expect(fn2.mock.calls.length).toBe(0);
    store.dispatch(set("qwer"));
    expect(fn1).toBeCalled();
    expect(fn2).toBeCalled();

    console.log(subs.mock.calls);
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
    const reducer = rootState.buildReducer();
    const store = createStore(reducer);
    expect(rootState.observers.length).toBe(2);

    rootState.use(store);
    store.dispatch({ type: "" });
    // store.dispatch(toggleEvent());
    const renderer = Render.create(
      <Consumer source={toggle}>
        {data => {
          expect(data).toEqual(toggle.getState());
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
    const reducer = rootState.buildReducer();
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
    rootState.use({
      getState: store.getState,
      subscribe: store.subscribe,
      context: "hello"
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();
    rootState.map(fn3);

    toggleViewState.subscribe(fn1);
    counter.map(el => el).subscribe(fn2);

    store.dispatch({ type: "init" });

    // store.dispatch(toggleEvent());
    // store.dispatch(toggleEvent());
    store.dispatch(toggleEvent());
    store.dispatch(counterEvent());
    store.dispatch(counterEvent());
    store.dispatch(counterEvent());
    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(4);
    expect(fn2.mock.calls).toMatchSnapshot();
    expect(fn1.mock.calls).toMatchSnapshot();
  });

  it("works ok with ministore", () => {
    const e = createAction("e");
    const state = createState("a");
    state.on(e, state => state);
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

    expect(fn.mock.calls[0][1]).toEqual(st.dispatch);
  });
});
