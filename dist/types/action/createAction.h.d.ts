export declare type FunctionMap<T> = {
    [M in keyof T]: (...args: any[]) => any;
};
export declare type CallFunctionMap<T extends FunctionMap<T>> = {
    [M in keyof T]: ReturnType<T[M]>;
};
export declare type StandardActionPayload<T> = {
    type: string;
    payload: T;
};
export declare type StandardAction<T> = {
    defaultValue?: T;
    (payload?: T): StandardActionPayload<T>;
    getType(): string;
};
export declare type AsyncActions<A, B, C> = {
    request: StandardAction<A>;
    success: StandardAction<B>;
    failure: StandardAction<C>;
};
