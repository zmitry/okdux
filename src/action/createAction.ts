import { StandardAction, FunctionMap, CallFunctionMap } from "./createAction.h";

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

function createAsyncAction<A, B, C>(name: string) {
  return createActions(
    {
      failure: build.action<A>(),
      success: build.action<B>(),
      request: build.action<C>()
    },
    name + "_"
  );
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
const t = createActions({
  act: build.async()
});

const createEffects = createActions;
export { createAction, build, createActions, createEffects };
