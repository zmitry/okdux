import { IReducerBuilder } from "../state";
import { StandardAction } from "./createAction.h";
export declare type EventHandler<S, P = any> = (s: S, p: P) => S;
export declare type IStateApi<S, T = any> = {
    [P in keyof T]: T[P] extends EventHandler<S, infer Payload> ? EventHandler<S, Payload> : null;
};
export declare type IApiActions<S, T = any> = {
    [P in keyof T]: T[P] extends EventHandler<S, infer Payload> ? StandardAction<Payload> : StandardAction<void>;
};
export declare function createApi<S, Model extends IStateApi<S, any>>(istate: IReducerBuilder<S>, actionDecl: Model): IApiActions<S, Model> & {
    update: (state: S, payload: Partial<S>) => S;
};
