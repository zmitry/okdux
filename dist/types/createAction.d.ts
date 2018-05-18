export declare type StandardActionPayload<T> = {
    type: string;
    payload: T;
};
export declare type StandardAction<T> = (payload: T) => {
    type: string;
    payload: T;
};
declare function createAction<T>(type: string): StandardAction<T>;
export declare type AsyncActions<A, B, C> = {
    request: StandardAction<A>;
    success: StandardAction<B>;
    failure: StandardAction<C>;
};
declare const build: {
    plain: typeof createAction;
    action<T>(): (name: string) => StandardAction<T>;
    mutator: <T>(defaultValue: T) => (name: string) => StandardAction<T>;
    async: () => (name: any) => AsyncActions<{}, {}, {}>;
};
export declare type Unpack<T> = T extends StandardAction<infer F> ? F : any;
declare function createActions<T extends {
    [M in keyof T]: T[M];
}>(actions: T, prefix?: string): {
    [M in keyof T]: StandardAction<Unpack<ReturnType<T[M]>>>;
};
declare function createEffects<T>(actions: T, prefix?: string): {
    [M in keyof T]: AsyncActions<any, any, any>;
};
export { createAction, build, createActions, createEffects };
