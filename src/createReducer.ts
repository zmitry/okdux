import { get } from "lodash";
import { combineReducers, compose } from "redux";
import { StandardAction, StandardActionPayload } from "./createAction";
import { Store } from ".";

// function isReducerBuilder(builder) {
//   return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
// }

let identity = <T>(d: T, ..._: any[]): T => d;

interface IReducerBuilder<T> {
  select<RootState>(rootState: RootState): T;
  mapState<R, P>(fn: (state: T, props: P) => R): (root: any, props) => R;
  on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
}

type Unpacked<T> = T extends IReducerBuilder<infer U>
  ? U
  : T extends StandardAction<infer P> ? P : T;

type R<T> = { [P in keyof T]: Unpacked<T[P]> };

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

  on<E>(action: StandardAction<E>, handler) {
    if (action === undefined || action === null || !action.getType) {
      throw new Error("action should be an action, got " + action);
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

  mapState = (fn = identity) => {
    return (state, props) => fn(this.select(state), props, state);
  };

  public reducer = <P>(state: T = this.initialState, action: StandardActionPayload<P>): T => {
    if (!action) {
      return state;
    }
    const { type, payload } = action;
    if (this.handlers[type] && this.handlers[type].handler) {
      const handler = this.handlers[type].handler;
      state = handler(state, payload, action);
    }

    return state;
  };
}

export type ReducerOrAction = BaseReducerBuilder<any> | StandardAction<any>;
export class CombinedReducer<T extends { [i: string]: ReducerOrAction }> extends BaseReducerBuilder<
  R<T>
> {
  nestedReducer;
  constructor(public stores: T) {
    super({} as any);

    const parent = { getPath: this.getPath.bind(this) };
    Object.keys(stores).forEach(el => {
      let reducer = stores[el];
      if (reducer && reducer.getType) {
        console.log(reducer.defaultValue, reducer);
        reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, (_, p) => p);
        stores[el] = reducer;
      }
      reducer.setPath(el);
      reducer.parent = parent;
    });
    // @ts-ignore
    this.nestedReducer = combineReducers(
      Object.keys(stores).reduce((acc, el) => {
        acc[el] = stores[el].reducer;
        return acc;
      }, {})
    ).bind(this);
    const plainReducer = this.reducer;
    this.reducer = (state = this.initialState, action) => {
      return plainReducer(this.nestedReducer(state, action), action);
    };
  }
}

export function createState<T>(data: T) {
  return new BaseReducerBuilder<T>(data);
}
export function combineState<T extends { [i: string]: ReducerOrAction }>(data: T) {
  return new CombinedReducer<T>(data);
}

export { R, Unpacked, IReducerBuilder };
