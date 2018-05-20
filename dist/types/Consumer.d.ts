/// <reference types="react" />
import React from "react";
export declare class Consumer extends React.Component<any, {
    currentState: any;
}> {
    constructor(props: any);
    unsub: any;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): any;
}
