import { StandardAction, FunctionMap, CallFunctionMap, AsyncActions } from "./createAction.h";

const mutator = <T>(defaultValue: T) => <TP = T>(
  name: string | Symbol = Symbol()
): StandardAction<TP> => {
  let dispatch = null;

  const actionRaw = (data = defaultValue) => {
    return { type: name, payload: data };
  };
  const action: any = (data = defaultValue) => {
    const action = actionRaw(data);
    dispatch && dispatch(action);
    return action;
  };
  const actionMeta = {
    getType: () => name,
    defaultValue,
    setDispatch(d) {
      dispatch = d;
    },
    getDispatch: () => dispatch,
    raw: actionRaw
  };

  return Object.assign(action, actionMeta);
};

const createAction = mutator(null);

function createAsyncAction<A, B, C>(name: string): AsyncActions<A, B, C> {
  return {
    request: createAction(name + "_REQUEST"),
    success: createAction(name + "_SUCCESS"),
    failure: createAction(name + "_FAILURE")
  };
}

const build = {
  plain: createAction,
  action<T>() {
    return (name: string) => createAction<T>(name);
  },
  mutator: mutator,
  async: <S, R = null, E = any>() => name => {
    return createAsyncAction<R, S, E>(name);
  }
};

function createActions<T extends FunctionMap<T>>(
  actions: T,
  prefix: string = "@"
): CallFunctionMap<T> {
  return Object.keys(actions).reduce<CallFunctionMap<T>>(
    (acc, el) => {
      acc[el] = actions[el](prefix + "/" + el);
      return acc;
    },
    {} as CallFunctionMap<T>
  );
}

const createEffects = createActions;
export { createAction, build, createActions, createEffects };
