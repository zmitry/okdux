export declare function checkKeyUsage(data: any, fn: any): any[];
export declare function wrapKeys(keys: any, data: any): void;
export declare class Store {
    reactors: any[];
    observers: any[];
    selector: any;
    currentState: any;
    _consumer: any;
    getState: () => any;
    subscribe: (fn: any) => () => any[];
    getConsumer: () => any;
    constructor(fn?: (d: any) => any);
    use: ({ subscribe, getState }: {
        subscribe: any;
        getState: any;
    }) => void;
    addStore: (store: any) => void;
    map: (fn: any) => Store;
    set: (data: any, keys: any) => void;
    callReactors: (data: any) => void;
}
export declare function createConsumer(store: any): {
    new (): {
        state: {
            currentState: any;
        };
        unsub: any;
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): any;
    };
    displayName: string;
};
