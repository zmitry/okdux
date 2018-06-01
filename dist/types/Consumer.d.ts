/// <reference types="react" />
import * as React from "react";
export declare class Consumer extends React.PureComponent<{
    children: any;
    source: any;
    selector: any;
}, {
    currentState: any;
}> {
    static displayName: string;
    state: {
        currentState: any;
    };
    _unsubscribe: Function;
    _hasUnmounted: boolean;
    propStore: any;
    store: any;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): any;
    subscribe(): void;
    unsubscribe(): void;
}
