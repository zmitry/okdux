import { buildAction, PACreator, AsyncCreator, EmptyOrPayload, Box } from "typesafe-actions";

const createAction = <T>(name: string) => buildAction(name).payload<T>();

export type PlainAction<T> = PACreator<string, T> & { defaultValue: T };
const build = {
  plain: name => {
    return buildAction(name).payload();
  },
  mutator: <T>(defaultValue: T) => (name: string): PlainAction<T> => {
    const action: any = (data = defaultValue) => ({ type: name, payload: data });
    action.defaultValue = defaultValue;
    action.getType = () => name;
    return action;
  },
  async: (payload = d => d, meta = d => d) => name => {
    return buildAction(name).async();
  }
};

export type Unpack<T> = T extends PlainAction<infer F> ? F : any;

function createActions<T extends { [M in keyof T]: T[M] }>(
  actions: T,
  prefix: string = "@"
): { [M in keyof T]: PlainAction<Unpack<ReturnType<T[M]>>> } {
  //@ts-ignore
  return Object.keys(actions).reduce((acc, el) => {
    acc[el] = actions[el](prefix + "/" + el);
    return acc;
  }, {});
}

function createEffects<T>(
  actions: T,
  prefix: string = "@"
): { [M in keyof T]: AsyncCreator<string, any, any, any> } {
  // @ts-ignore
  return Object.keys(actions).reduce((acc, el) => {
    acc[el] = actions[el](prefix + "/" + el);
    return acc;
  }, {});
}

export { createAction, buildAction, build, createActions, createEffects };
