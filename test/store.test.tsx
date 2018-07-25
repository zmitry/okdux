import React from "react";
import { createStore } from "redux";
import { createState, createAction, StandardAction } from "../src";
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
  it("works with use dispatch", () => {
    const state = createState(0);
    const action = createAction("a");
    const resetAct = createAction("reset");

    state.on(action, () => 5).reset(resetAct);
    const store = createStore(state.reducer);
    action(0);
    expect(store.getState()).toBe(0);
    state.use(store.dispatch);
    action(0);
    expect(store.getState()).toBe(5);
    resetAct();
    expect(store.getState()).toBe(0);
  });

  it("should work with plain reducers", () => {
    const st2 = createState(0);
    const st1 = createState("a");

    const reducer = (state = "qwer", action) => state;
    const storeWithReducer = createState({
      nested: reducer
    });
    const composed = createState({
      st1,
      st2,
      reducerKey: storeWithReducer
    });
    expect(composed.reducer({}, null)).toEqual({
      reducerKey: { nested: "qwer" },
      st1: "a",
      st2: 0
    });
    expect(storeWithReducer.stores.nested.getPath()).toEqual(["reducerKey", "nested"]);
  });
});
