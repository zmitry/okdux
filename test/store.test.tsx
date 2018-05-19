import React from "react";
import { createStore } from "redux";
import { wrapKeys, checkKeyUsage, Store } from "../src/store";
import { createState, createAction, createConsumer } from "../src";
import Render from "react-test-renderer";
let mockedData;
let changedKeys;
beforeAll(() => {
  mockedData = { ui: { a: "1" }, users: { password: "" } };

  changedKeys = ["ui.a", "users"];
});
describe("restate", () => {
  it("works ok with key check", () => {
    wrapKeys(changedKeys, mockedData);

    const [_1, deps] = checkKeyUsage(mockedData, data => {
      return data.ui.a;
    });
    expect(deps).toEqual(["ui", "ui.a"]);
    const [_2, deps2] = checkKeyUsage(mockedData, data => {
      return data.ui;
    });
    expect(deps2).toEqual(["ui"]);

    const [_3, deps3] = checkKeyUsage(mockedData, data => {
      return { a: data.ui, b: data.users };
    });
    expect(deps3).toEqual(["ui", "users"]);
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
    const Consumer = createConsumer(toggle);
    const renderer = Render.create(
      <Consumer>
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
    rootState.use(store);

    const toggleViewState = rootState
      .map(state => {
        return {
          toggle: state.toggle
        };
      })
      .map(el => ({
        state: el,
        toggleEvent: e => dispatch(toggleEvent(e))
      }));
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    toggleViewState.subscribe(fn1);
    counter.subscribe(fn2);
    store.dispatch({ type: "init" });
    // store.dispatch(toggleEvent());
    // store.dispatch(toggleEvent());
    // store.dispatch(toggleEvent());
    store.dispatch(counterEvent());
    store.dispatch(counterEvent());
    store.dispatch(counterEvent());
    expect(fn1.mock.calls.length).toBe(1);
    expect(fn2.mock.calls.length).toBe(4);
  });
});
