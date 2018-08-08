import { StandardAction, StandardActionPayload } from "../action";
import { identity } from "./helpers";

export const reducerSymbol = Symbol();
function get(object, keys) {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return get(object, keys.slice(1));
  }
  return object;
}

export function isReducer(reducer) {
  return reducer && reducer[reducerSymbol];
}
export class BaseReducerBuilder<T> {
  public handlers = {};
  parent;
  path;
  private [reducerSymbol] = {};
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
      throw new Error("action should be an action type, got " + action);
    }
    this.handlers[action.getType()] = {
      handler,
      action
    };
    return this;
  }

  select = <R>(rs: R) => {
    if (typeof rs === "function") {
      return this.mapState(rs);
    }

    const path = this.getPath();
    return path.length ? get(rs, this.getPath()) : rs;
  };

  mapState = (fn = identity) => {
    return (state, props) => fn(this.select(state), props, state);
  };

  reset = action => {
    this.on(action, state => this.initialState);
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

  mixin = fn => ({ ...(this as object), ...fn(this) });
}
