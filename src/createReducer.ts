import { get } from "lodash";
import { combineReducers, compose } from "redux";
import { StandardAction, StandardActionPayload, createAction, build } from "./createAction";

let identity = <T>(d: T, ..._: any[]): T => d;
let identity2 = <T>(_, d: T): T => d;

interface IReducerBuilder<T> {
  stores: WrappedValues<T>;
  select<RootState>(rootState: RootState): T;
  mapState<R, P>(fn: (state: T, props: P) => R): (root: any, props) => R;
  on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
}

type Unpacked<T> = T extends IReducerBuilder<infer U>
  ? U
  : T extends StandardAction<infer P> ? P : T extends (...args: any[]) => infer R ? R : T;

type R<T> = { [P in keyof T]: Unpacked<T[P]> };

enum Keys {
  select,
  mapState
}
type WrappedValues<T> = { [P in keyof T]: Pick<IReducerBuilder<T[P]>, keyof typeof Keys> };

export class BaseReducerBuilder<T> implements IReducerBuilder<T> {
  public handlers = {};
  parent;
  path;
  constructor(public initialState: T) {
    if (typeof initialState === "undefined") {
      throw new Error("initial state should not be undefined");
    }
    this.reducer = this.reducer.bind(this);
  }

  setPath(path) {
    this.path = path;
  }

  getPath() {
    if (this.parent) {
      return this.parent.getPath().concat(this.path);
    } else {
      return this.path ? [this.path] : [];
    }
  }

  // @ts-ignore
  on<E>(action: StandardAction<E>, handler) {
    if (action === undefined || action === null || !action.getType) {
      throw new Error("action should be an action type, got " + action);
    }
    this.handlers[action.getType()] = {
      handler,
      action
    };
    return this;
  }

  select = <R>(rs: R) => {
    const path = this.getPath();
    return path.length ? get(rs, this.getPath()) : rs;
  };
  // @ts-ignore
  mapState = (fn = identity) => {
    return (state, props) => fn(this.select(state), props, state);
  };

  public reducer = <P>(state: T = this.initialState, action: StandardActionPayload<P>): T => {
    if (!action) {
      return state;
    }
    const { type, payload } = action;
    const handlerObj = this.handlers[type];
    if (handlerObj && handlerObj.handler) {
      const handler = this.handlers[type].handler;
      state = handler(state, payload, action);
    }

    return state;
  };
}
export type ReducerOrAction = BaseReducerBuilder<any> | CombinedReducer<any> | StandardAction<any>;

export class CombinedReducer<T extends { [i: string]: ReducerOrAction }> extends BaseReducerBuilder<
  R<T>
> {
  stores: any;
  constructor(storesToParse: T) {
    super({} as any);

    const parent = { getPath: this.getPath.bind(this) };
    const stores = {};
    const reducersMap = {};
    this.stores = stores as any;
    Object.keys(storesToParse).forEach(el => {
      let reducer = storesToParse[el];

      if (reducer && (reducer as StandardAction<any>).getType) {
        reducer = reducer as StandardAction<any>;
        reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, identity2);
      } else if (typeof reducer === "function") {
        const tmpReducer = new BaseReducerBuilder(null);
        tmpReducer.reducer = reducer;
        reducer = tmpReducer;
      }
      stores[el] = reducer as BaseReducerBuilder<any>;
      stores[el].setPath(el);
      stores[el].parent = parent;
      reducersMap[el] = stores[el].reducer;
    });

    const nestedReducer = combineReducers(reducersMap);
    const plainReducer = this.reducer;
    this.reducer = (state, action) => {
      return plainReducer(nestedReducer(state, action) as any, action);
    };
  }
}

export function createState<T>(data: T) {
  return new BaseReducerBuilder<T>(data);
}
export function combineState<T extends { [i: string]: ReducerOrAction }>(data: T) {
  return new CombinedReducer<T>(data);
}

export { R, Unpacked, IReducerBuilder, WrappedValues, Keys };
