import { BaseReducerBuilder } from "./BaseReducer";
import { R } from "./reducer.h";
export declare class CombinedReducer<T extends {
    [i: string]: any;
}> extends BaseReducerBuilder<R<T>> {
    stores: any;
    constructor(storesToParse: T);
}
