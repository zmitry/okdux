import { createState, createAction, build } from "../src";

describe("restate", () => {
  let a;
  let b;
  let c;
  let d;
  let rootReducer;
  let toggle;
  let testState = { c: { a: "aa", b: false } };
  beforeEach(() => {
    toggle = createAction("toggle");
    a = createState("a");
    b = createState(true);
    c = createState({ a, b });
    d = createState({ c });
    rootReducer = d.reducer;
  });
  it("works basic", () => {
    let toggle = build.mutator(true)("toggle");
    let a = createState("a");
    expect(() => createState()).toThrowError(Error);
    expect(a.reducer()).toBe("a");
    let b = createState({ a, toggle });

    expect(b.reducer()).toEqual({ a: "a", toggle: true });
  });
  it("selectors work ok", () => {
    expect(a.select(testState)).toEqual("aa");
    expect(b.select(testState)).toEqual(false);
    expect(c.select(testState)).toEqual(testState.c);
    expect(d.mapState()(testState)).toEqual(testState);
  });

  it("works ok with reducer", () => {
    expect(rootReducer({}, {})).toEqual({ c: { a: "a", b: true } });
  });

  it("works ok with reducer and actions", () => {
    b.on(toggle, (_, p) => {
      return p;
    });
    const state = rootReducer({}, toggle(false));
    expect(b.select(state)).toEqual(false);
    const state2 = rootReducer(state, toggle(false));
    expect(b.select(state2)).toEqual(false);
  });
  it("works with nested objects", () => {
    c = createState({ f: { d: { a: "q" } }, foo: "qwer" });
    const reducer = c.reducer;
    expect(reducer()).toEqual({ f: { d: { a: "q" } }, foo: "qwer" });
  });
  it("handles errors", () => {
    expect(() => createState.on(undefined)).toThrow();
    expect(() => createState.on(null, () => {})).toThrow();
  });

  it("works with subpath", () => {
    a = createState("a");
    b = createState(true);
    c = createState({ a, b });
    c.setPath("name");
    const reducer = c.reducer;
    expect(a.select({ name: { a: "a" } })).toBe("a");
  });
});
