import { combineReducers } from "redux";
import { StandardAction, StandardActionPayload } from "./createAction";
import { Store } from ".";

export const reducerPathSymbol = Symbol();
export const ctxSymbol = Symbol();

function makeChangesMonitor() {
  let keys = [];
  let action;
  return {
    setChanged: (newAction, key) => {
      if (action !== newAction) {
        keys = [key];
        action = newAction;
      } else {
        keys.push(key);
      }
    },
    // @ts-ignore
    getChangedKeys: () => keys
  };
}

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
function traverseReducers(reducers, { path, ctx }) {
  for (let key in reducers) {
    const reducer = reducers[key];
    if (isReducerBuilder(reducer)) {
      reducer[reducerPathSymbol] = (path ? path + "." : "") + key;
      ctx.addStore(reducer);
    }
  }
}

const atomReducer = (defaultV, type) => (state = defaultV, action) =>
  action && action.type === type ? action.payload : state;

const identityWithDefault = d => (s = d) => s;
function pruneInitialState(initialState) {
  const acc = { reducers: {}, defaultState: {} };
  let hasReducers = false;
  for (let item in initialState) {
    const el = item;
    if (isReducerBuilder(initialState[el])) {
      acc.reducers[el] = initialState[el].buildReducer();
      hasReducers = true;
    } else if (initialState[el] && initialState[el].getType) {
      const t = initialState[el].getType();
      hasReducers = true;
      acc.reducers[el] = atomReducer(initialState[el].defaultValue, t);
    } else {
      acc.defaultState[el] = initialState[el];
    }
  }
  if (hasReducers) {
    for (let el in initialState) {
      if (!isReducerBuilder(initialState[el]) && !initialState[el].getType) {
        acc.reducers[el] = identityWithDefault(initialState[el]);
      }
    }
  } else {
    return { reducers: {}, defaultState: initialState };
  }
  return acc;
}
let identity = <T>(d: T, ..._: any[]): T => d;

function getDefaultReducer(initialState, { path, ctx }) {
  let defaultState = initialState;
  let nestedReducer = identity;

  if (typeof initialState === "object" && !Array.isArray(initialState)) {
    traverseReducers(initialState, { path, ctx });
    const res = pruneInitialState(initialState);

    if (Object.keys(res.reducers).length !== 0) {
      // @ts-ignore
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

export class ReducerBuilder<T> implements IReducerBuilder<T> {
  public handlers = {};
  private [reducerPathSymbol] = "";
  private [ctxSymbol] = {};
  private _reducer;

  constructor(public initialState: T) {}
  // @ts-ignore
  on(action, handler) {
    if (action === undefined || action === null || !action.getType) {
      throw new Error("action should be an action, got " + action);
    }
    this.handlers[action.getType()] = handler;
    return this;
  }
  // @ts-ignore
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
  get reducer() {
    return this._reducer;
  }
  buildReducer(path: string) {
    if (path) {
      this[reducerPathSymbol] = path;
    }
    // @ts-ignore
    if (!this[ctxSymbol].changesMonitor) {
      // @ts-ignore
      this[ctxSymbol].changesMonitor = makeChangesMonitor();
    }
    const { defaultState, nestedReducer } = getDefaultReducer(this.initialState, {
      path: this[reducerPathSymbol] || path,
      ctx: {
        // @ts-ignore
        addStore: this.addStore,
        // @ts-ignore
        changesMonitor: this[ctxSymbol].changesMonitor
      }
    });

    const reducer = <P>(state: T = defaultState, action: StandardActionPayload<P>): T => {
      state = nestedReducer(state, action);

      if (!action) {
        return state;
      }

      const { type, payload } = action;
      if (this.handlers[type]) {
        const handler = this.handlers[type];
        let nextState = handler(state, payload, action);
        if (nextState !== state) {
          // @ts-ignore
          this[ctxSymbol].changesMonitor.setChanged(action, this[reducerPathSymbol]);
        }
        state = nextState;
      }

      return state;
    };
    this._reducer = reducer;
    return reducer;
  }
}

export { R, Unpacked, IReducerBuilder };
