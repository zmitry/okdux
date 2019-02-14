import { createAction } from "./createAction";
import { IReducerBuilder } from "../state";
import { StandardAction } from "./createAction.h";

export type EventHandler<S, P = any> = (s: S, p: P) => S;

export type IStateApi<S, T = any> = {
  [P in keyof T]: T[P] extends EventHandler<S, infer Payload> ? EventHandler<S, Payload> : null
};
export type IApiActions<S, T = any> = {
  [P in keyof T]: T[P] extends EventHandler<S, infer Payload>
    ? StandardAction<Payload>
    : StandardAction<void>
};

export function createApi<S, Model extends IStateApi<S, any>>(
  istate: IReducerBuilder<S>,
  actionDecl: Model
): IApiActions<S, Model> & { update: (state: S, payload: Partial<S>) => S };

export function createApi(state, actionsDecl) {
  const actions = {};
  for (let actionKey in actionsDecl) {
    const handler = actionsDecl[actionKey];
    const act = createAction(Symbol(actionKey));
    state.on(act, handler);
    actions[actionKey] = act;
  }
  return actions;
}
