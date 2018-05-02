import configureMockStore from "redux-mock-store";
import { debounce } from "lodash";

import { createAction } from "../src/effect";

const thunkM = ({ dispatch, getState }) => next => action => {
  if (typeof action === "function") {
    return action(dispatch, getState);
  }

  return next(action);
};
jest.useFakeTimers();

const mockStore = configureMockStore([thunkM]);
describe("restate effects", () => {
  let store;
  let toggle;
  let rootDomain;
  beforeEach(() => {
    toggle = createAction("toggle");
    store = mockStore({ test: "true" });
  });
  it("works", () => {
    const mockCallback = jest.fn();
    // toggle.watch(mockCallback);
    toggle.watch(d => {
      console.log(d);
    });

    const mappedToggle = toggle.map(data => ({ kek: false }));
    const mappedToggle2 = mappedToggle.enhance(fn => {
      return cb => cb();
    });

    const res = store.dispatch(mappedToggle(true));
    // console.log("res: ", res);

    console.log(store.getActions());
    //expect(mockCallback.mock.calls[0][0]).toBe(true);
    //expect(mockCallback.mock.calls[0][1]).toEqual({test: 'true'});
  });
});
