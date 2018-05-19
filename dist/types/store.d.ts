export declare function checkKeyUsage(data: any, fn: any): any[];
export declare function wrapKeys(keys: any, data: any): void;
export declare class Store {
    reactors: any[];
    observers: any[];
    selector: any;
    currentValue: any;
    getValue: () => any;
    react: (fn: any) => () => any[];
    Consumer: any;
    constructor(fn?: (d: any) => any);
    use: ({ subscribe, getState }: {
        subscribe: any;
        getState: any;
    }) => void;
    map: (fn: any) => Store;
    set: (data: any, keys: any) => void;
    callReactors: (data: any) => void;
}
