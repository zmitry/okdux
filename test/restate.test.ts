import { createState } from "../src/createReducer";
import { createAction } from "../src/createAction";

describe("restate", () => {
  let a;
  let b;
  let c;
  let d;
  let rootReducer;
  let toggle;
  let testState = { c: { a: "aa", b: false, foo: "qwrw" } };
  beforeEach(() => {
    toggle = createAction("toggle");
    a = createState("a");
    b = createState(true);
    c = createState({ a, b, foo: "qwer" });
    d = createState({ c });
    rootReducer = d.buildReducer();
  });
  it("works basic", () => {
    let toggle = createAction("toggle");
    let a = createState("a");
    expect(() => createState()).toThrowError(Error);
    expect(a.buildReducer()()).toBe("a");
    let b = createState({});

    expect(b.buildReducer()()).toEqual({});
  });
  it("selectors work ok", () => {
    expect(a.select(testState)).toEqual("aa");
    expect(b.select(testState)).toEqual(false);
    expect(c.select(testState)).toEqual(testState.c);
    expect(d.select(testState)).toEqual(testState);
  });

  it("works ok with reducer", () => {
    expect(rootReducer({}, {})).toEqual({ c: { a: "a", b: true, foo: "qwer" } });
  });

  it("works ok with reducer and actions", () => {
    b.on(toggle, (_, p) => {
      return p;
    });
    a.handle(["TEST", "OK"], (_, p) => p);

    const state = rootReducer({}, toggle(false));
    expect(b.select(state)).toEqual(false);
    const state2 = rootReducer(state, toggle(false));
    expect(b.select(state2)).toEqual(false);
    const state3 = rootReducer(state, { type: "TEST", payload: "a" });
    expect(a.select(state3)).toEqual("a");
    const state4 = rootReducer(state, { type: "OK", payload: "b" });
    expect(a.select(state4)).toEqual("b");
  });
  it("works with nested objects", () => {
    c = createState({ f: { d: { a: "q" } }, foo: "qwer" });
    const reducer = c.buildReducer();
    expect(reducer({}, {})).toEqual({ f: { d: { a: "q" } }, foo: "qwer" });
  });
  it("handles errors", () => {
    expect(() => createState.on(undefined)).toThrow();
    expect(() => createState.on(null, () => {})).toThrow();
  });

  it("works with subpath", () => {
    a = createState("a");
    b = createState(true);
    c = createState({ a, b });
    const reducer = c.buildReducer("name");
    expect(a.select({ name: { a: "a" } })).toBe("a");
  });
});
