import { wrapKeys, checkKeyUsage, Store } from "../src/store";
import { createState } from "../src";

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
    computedStore.react(cb);

    store.set(newData, ["ui.a", "users.password"]);
    expect(cb.mock.calls[0][0]).toEqual({ ui: "5", password: "5dsf" });
    store.set({ ...newData, ui: { a: "6" } }, ["users.password"]);
    store.set({ ...newData, ui: { a: "7" } }, ["ui.a"]);

    console.log(cb.mock.calls);
    expect(cb.mock.calls.length).toEqual(3);
  });

  it("works ok with reducer", () => {
    const state = createState(0);
    state.handle("145", (data, payload) => {
      return payload * 2;
    });
    let value = 5;
    state.map(e => e).react(console.log);
    const reducer = state.buildReducer();
    value = reducer(4, { type: "123" });
    state.use({
      subscribe: fn => {
        fn();
        value = reducer(4, { type: "145", payload: 6 });

        fn();
      },
      getState: () => {
        return value;
      }
    });
  });
});
