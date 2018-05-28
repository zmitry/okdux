export type StandardActionPayload<T> = { type: string; payload: T };

export type StandardAction<T> = {
  defaultValue?: T;
  (payload: T): { type: string; payload: T };
  getType(): string;
};

function createAction<T>(type: string): StandardAction<T> {
  const action = (payload: T) => ({ type, payload });
  const getType = () => type;
  return Object.assign(action, { getType });
}

export type AsyncActions<A, B, C> = {
  request: StandardAction<A>;
  success: StandardAction<B>;
  failure: StandardAction<C>;
};

function createAsyncAction<A, B, C>(name: string): AsyncActions<A, B, C> {
  return {
    request: createAction(name + "_REQUEST"),
    success: createAction(name + "_SUCCESS"),
    failure: createAction(name + "_FAILURE")
  };
}

const build = {
  plain: createAction,
  action<T>(): (name: string) => StandardAction<T> {
    // @ts-ignore
    return createAction(name);
  },
  mutator: <T>(defaultValue: T) => (name: string): StandardAction<T> => {
    const action: any = (data = defaultValue) => ({ type: name, payload: data });
    action.defaultValue = defaultValue;
    action.getType = () => name;
    return action;
  },
  async: () => name => {
    return createAsyncAction(name);
  }
};

export type Unpack<T> = T extends StandardAction<infer F> ? F : any;

function createActions<T extends { [M in keyof T]: T[M] }>(
  actions: T,
  prefix: string = "@"
): { [M in keyof T]: StandardAction<Unpack<ReturnType<T[M]>>> } {
  // @ts-ignore
  return Object.keys(actions).reduce((acc, el) => {
    acc[el] = actions[el](prefix + "/" + el);
    return acc;
  }, {});
}

function createEffects<T>(
  actions: T,
  prefix: string = "@"
): { [M in keyof T]: AsyncActions<any, any, any> } {
  // @ts-ignore
  return createActions(actions, prefix);
}

export { createAction, build, createActions, createEffects };
