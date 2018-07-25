import { createActions } from "./createAction";

export type FunctionMap<T> = { [M in keyof T]: (...args: any[]) => any };
export type CallFunctionMap<T extends FunctionMap<T>> = { [M in keyof T]: ReturnType<T[M]> };

export type StandardActionPayload<T> = { type: string; payload: T };
export type StandardAction<T> = {
  defaultValue?: T;
  (payload?: T): StandardActionPayload<T>;
  getType(): string;
};

export type AsyncActions<A, B, C> = {
  request: StandardAction<A>;
  success: StandardAction<B>;
  failure: StandardAction<C>;
};
