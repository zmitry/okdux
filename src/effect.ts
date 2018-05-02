import { compose } from "redux";

const typeKey = Symbol();

function assignProperty(object, name, value) {
  Reflect.set(object, name, value);
}
export function createEnhancedAction(name, actionType = Symbol(), thunkEnhancers) {
  let watcher;

  function create(payload) {
    const res = { type: name, payload: payload, [typeKey]: actionType };
    setTimeout(() => watcher && watcher(res), 0);
    return res;
  }

  function getType() {
    return actionType;
  }

  let { mappers, enhancers } = thunkEnhancers || {};

  const enhanced = () => {
    const mapper = compose(...mappers);
    const enhancer = compose(...enhancers);

    const dispatcher = enhancer(cb => cb());

    return args => (dispatch, getState) => {
      dispatcher(() => {
        const action = create(args);
        const payload = mapper(action.payload, getState(), args);
        const res = dispatch({ ...action, payload });
        return res;
      });
    };
  };

  function map(fn) {
    return createEnhancedAction(name, Symbol(), {
      mappers: mappers ? [fn, ...mappers] : [fn],
      enhancers
    });
  }

  function mapFn(fn) {
    return createEnhancedAction(name, Symbol(), {
      mappers: mappers,
      enhancers: enhancers ? [fn, ...enhancers] : [fn]
    });
  }

  function watch(fn) {
    watcher = fn;
  }

  const resultAC = thunkEnhancers ? enhanced() : create;
  assignProperty(resultAC, "create", create);
  assignProperty(resultAC, "watch", watch);
  assignProperty(resultAC, "map", map);
  assignProperty(resultAC, "mapFn", mapFn);
  assignProperty(resultAC, "getType", getType);

  return resultAC;
}

export type Action<T> = {
  type: string;
  payload: T;
};

export type ActionFactory<T> = {
  (args: T): Action<T> | undefined;
  watch(fn: (data: Action<T>) => void): void;
  map<M>(fn: ((data: T) => M)): ActionFactory<M>;
  mapFn(fn: () => void): ActionFactory<T>;
};

export function createAction<T>(name: string): ActionFactory<T>;
export function createAction(name: string) {
  return createEnhancedAction(name);
}
