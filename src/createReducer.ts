import { get } from "lodash";
import { combineReducers, compose } from "redux";
import im from "object-path-immutable";
import { StandardAction, StandardActionPayload } from "./createAction";
import { LensCreator, makeLens } from "./lens";

// function isReducerBuilder(builder) {
//   return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
// }

let identity = <T>(d: T, ..._: any[]): T => d;

interface IReducerBuilder<T> {
  select<RootState>(rootState: RootState): T;
  mapState<R, P>(fn: (state: T, props: P) => R): (root: any, props) => R;
  on<E>(event: StandardAction<E>, handler: (state: T, payload: E) => T): IReducerBuilder<T>;
  on<E, R>(
    event: StandardAction<E>,
    lens: (p: E, prop: LensCreator<T, E>) => LensCreator<R, E>,
    handler: (state: R, payload: E) => R
  ): IReducerBuilder<T>;
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

  // @ts-ignore
  on<E>(action: StandardAction<E>, handlerOrLens, handler = null) {
    if (handler) {
      this.lens(action, handlerOrLens, handler);
      return this;
    } else {
      handler = handlerOrLens;
    }
    if (action === undefined || action === null || !action.getType) {
      throw new Error("action should be an action, got " + action);
    }
    this.handlers[action.getType()] = {
      handler,
      action
    };
    return this;
  }
  lens(action, lens, handler) {
    const propLens = makeLens();
    this.handlers[action.getType()] = {
      handler,
      lens,
      action
    };
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
      if (handlerObj.lens) {
        const path = handlerObj.lens(payload, makeLens()).path;
        const data = get(state, path);

        if (data) {
          const subres = handlerObj.handler(data, payload);
          state = im.set(state, path, subres);
        }
      } else {
        const handler = this.handlers[type].handler;
        state = handler(state, payload, action);
      }
    }

    return state;
  };
}

export type ReducerOrAction = BaseReducerBuilder<any> | StandardAction<any>;
export class CombinedReducer<T extends { [i: string]: ReducerOrAction }> extends BaseReducerBuilder<
  R<T>
> {
  constructor(storesToParse: T) {
    super({} as any);

    const parent = { getPath: this.getPath.bind(this) };
    const stores = {};
    // @ts-ignore
    this.stores = stores;
    Object.keys(storesToParse).forEach(el => {
      let reducer = storesToParse[el];

      // @ts-ignore
      if (reducer && reducer.getType) {
        // @ts-ignore
        reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, (_, p) => p);
      }
      stores[el] = reducer;

      // @ts-ignore
      reducer.setPath(el);
      // @ts-ignore
      reducer.parent = parent;
    });

    const reducersMap = Object.keys(stores).reduce((acc, el) => {
      // @ts-ignore
      acc[el] = stores[el].reducer;
      return acc;
    }, {});

    // @ts-ignore
    const nestedReducer = combineReducers(reducersMap);
    const plainReducer = this.reducer;
    // @ts-ignore
    this.reducer = (state = this.initialState, action) => {
      // @ts-ignore
      return plainReducer(nestedReducer(state, action), action);
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
