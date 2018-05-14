import { combineReducers } from "redux";
import { StandardAction, StandardActionPayload } from "./createAction";

const reducerPathSymbol = Symbol();

function getProp(object, keys) {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1));
  }
  return object;
}

function isReducerBuilder(builder) {
  return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
}
function traverseReducers(reducers, path) {
  for (let key in reducers) {
    const reducer = reducers[key];
    if (isReducerBuilder(reducer)) {
      reducer[reducerPathSymbol] = (path ? path + "." : "") + key;
    }
  }
}

const atomReducer = (defaultV, type) => (state = defaultV, action) =>
  action && action.type === type ? action.payload : state;

const identityWithDefault = d => (s = d) => s;
function pruneInitialState(initialState) {
  return Object.keys(initialState).reduce(
    (acc, el) => {
      if (isReducerBuilder(initialState[el])) {
        acc.reducers[el] = initialState[el].buildReducer();
      } else if (initialState[el] && initialState[el].getType) {
        const t = initialState[el].getType();
        acc.reducers[el] = atomReducer(initialState[el].defaultValue, t);
      } else {
        acc.defaultState[el] = initialState[el];
        acc.reducers[el] = identityWithDefault(initialState[el]);
      }
      return acc;
    },
    { reducers: {}, defaultState: {} }
  );
}
let identity = <T>(d: T, ..._: any[]): T => d;

function getDefaultReducer(initialState, path) {
  let defaultState = initialState;
  let nestedReducer = identity;
  if (typeof initialState === "object") {
    traverseReducers(initialState, path);
    const res = pruneInitialState(initialState);

    if (Object.keys(res.reducers).length !== 0) {
      //@ts-ignore
      nestedReducer = combineReducers(res.reducers);
    }
    defaultState = res.defaultState;
  }
  return { nestedReducer, defaultState };
}

interface IReducerBuilder<T> {
  select<RootState>(rootState: RootState): T;
  buildReducer(path: string): <P>(state: T, action: any) => T;
  mapState<R, P>(fn: (state: T, props: P) => R): (root: any) => R;
  handle(
    event: string | string[],
    handler: (state: T, payload: any, meta: any) => T | void
  ): IReducerBuilder<T>;
  on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
}

type Unpacked<T> = T extends IReducerBuilder<infer U>
  ? U
  : T extends StandardAction<infer P> ? P : T;

type R<T> = { [P in keyof T]: Unpacked<T[P]> };

class ReducerBuilder<T> implements IReducerBuilder<T> {
  public handlers = {};
  [reducerPathSymbol] = "";

  constructor(public initialState: T) {}
  //@ts-ignore
  on(action, handler) {
    if (action === undefined || action === null || !action.getType) {
      throw new Error("action should be an action, got " + action);
    }
    this.handlers[action.getType()] = handler;
    return this;
  }
  //@ts-ignore
  handle(type, handler) {
    if (Array.isArray(type)) {
      type.forEach(t => this.handle(t, handler));
    } else {
      this.handlers[type] = handler;
    }
    return this;
  }

  select = <R>(rs: R) => {
    if (this[reducerPathSymbol]) {
      return getProp(rs, this[reducerPathSymbol]);
    } else {
      return rs;
    }
  };
  // @ts-ignore
  mapState = fn => {
    return (state, props) => fn(this.select(state), props, state);
  };
  private _reducer;
  get reducer() {
    return this._reducer;
  }
  buildReducer(path: string) {
    if (path) {
      this[reducerPathSymbol] = path;
    }
    const { defaultState, nestedReducer } = getDefaultReducer(
      this.initialState,
      this[reducerPathSymbol] || path
    );
    const reducer = <P>(state: T = defaultState, action: StandardActionPayload<P>): T => {
      state = nestedReducer(state, action);

      if (!action) {
        return state;
      }

      const { type, payload } = action;
      if (this.handlers[type]) {
        const handler = this.handlers[type];
        state = handler(state, payload, action);
      }
      return state;
    };
    this._reducer = reducer;
    return reducer;
  }
}

function createState<T>(initialState: T): IReducerBuilder<R<T>> {
  if (initialState === undefined) {
    throw new Error("initial state cannot be undefined");
  }
  // @ts-ignore
  return new ReducerBuilder<T>(initialState);
}

export { createState, R, Unpacked, IReducerBuilder };
