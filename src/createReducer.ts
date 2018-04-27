import { combineReducers } from "redux";
import { getType, PACreator, FSACreator, Box, FSA } from "typesafe-actions";

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
  return typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
}
function traverseReducers(reducers, path) {
  for (let key in reducers) {
    const reducer = reducers[key];
    if (isReducerBuilder(reducer)) {
      reducer[reducerPathSymbol] = (path ? path + "." : "") + key;
    }
  }
}

const identityWithDefault = d => (s = d) => s;
function pruneInitialState(initialState) {
  return Object.keys(initialState).reduce(
    (acc, el) => {
      if (isReducerBuilder(initialState[el])) {
        acc.reducers[el] = initialState[el].buildReducer();
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
  handle(
    event: string | string[],
    handler: (state: T, payload: any, meta: any) => T | void
  ): IReducerBuilder<T>;
  on<E extends Box<any>, M extends Box<any>>(
    event: PACreator<string, E> | FSACreator<string, E, M>,
    handler: (state: T, payload: E) => T
  ): IReducerBuilder<T>;
}

type Unpacked<T> = T extends IReducerBuilder<infer U> ? U : T;

type R<T> = { [P in keyof T]: Unpacked<T[P]> };

class ReducerBuilder<T> implements IReducerBuilder<T> {
  public handlers = {};
  [reducerPathSymbol] = "";

  constructor(public initialState: T) {}

  on(action, handler) {
    if (action === undefined || action === null) {
      throw new Error("action should be an action, got " + action);
    }
    this.handlers[getType(action)] = handler;
    return this;
  }
  handle(type, handler) {
    if (Array.isArray(type)) {
      type.forEach(t => this.handle(t, handler));
    } else {
      this.handlers[type] = handler;
    }
    return this;
  }

  select<R>(rs: R) {
    if (this[reducerPathSymbol]) {
      return getProp(rs, this[reducerPathSymbol]);
    } else {
      return rs;
    }
  }
  buildReducer(path: string) {
    if (path) {
      this[reducerPathSymbol] = path;
    }
    const { defaultState, nestedReducer } = getDefaultReducer(
      this.initialState,
      this[reducerPathSymbol] || path
    );
    return <P>(state: T = defaultState, action: FSA<string, P, any>): T => {
      state = nestedReducer(state, action);

      if (!action) {
        return state;
      }

      const { type, payload, meta } = action;
      if (this.handlers[type]) {
        const handler = this.handlers[type];
        state = handler(state, payload, meta);
      }
      return state;
    };
  }
}

function createState<T>(initialState: T): IReducerBuilder<R<T>> {
  if (initialState === undefined) {
    throw new Error("initial state cannot be undefined");
  }
  // @ts-ignore
  return new ReducerBuilder<T>(initialState);
}

const a = createState("");
const b = createState("");
const c = createState({ a, b });

export { createState, R, Unpacked, Box, IReducerBuilder };
