import { StandardAction, FunctionMap, CallFunctionMap, AsyncActions } from "./createAction.h";
declare const createAction: <TP = any>(name?: string | Symbol) => StandardAction<TP>;
declare const build: {
    plain: <TP = any>(name?: string | Symbol) => StandardAction<TP>;
    action<T>(): (name: string) => StandardAction<T>;
    mutator: <T>(defaultValue: T) => <TP = T>(name?: string | Symbol) => StandardAction<TP>;
    async: <S, R = null, E = any>() => (name: any) => AsyncActions<R, S, E>;
};
declare function createActions<T extends FunctionMap<T>>(actions: T, prefix?: string): CallFunctionMap<T>;
declare const createEffects: typeof createActions;
export { createAction, build, createActions, createEffects };
