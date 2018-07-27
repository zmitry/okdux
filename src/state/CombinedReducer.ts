import { combineReducers } from "redux";

import { StandardAction } from "../action";
import { didentity, identity2 } from "./helpers";
import { BaseReducerBuilder, isReducer } from "./BaseReducer";
import { R } from "./reducer.h";

export class CombinedReducer<T extends { [i: string]: any }> extends BaseReducerBuilder<R<T>> {
  stores: any;
  constructor(storesToParse: T) {
    super({} as any);

    const parent = { getPath: this.getPath.bind(this) };
    const stores = {};
    const reducersMap = {};
    this.stores = stores as any;
    Object.keys(storesToParse).forEach(el => {
      let storeCandidate = storesToParse[el];

      if (storeCandidate && (storeCandidate as StandardAction<any>).getType) {
        // store candidate is action with default value so we transform it to reducer
        storeCandidate = storeCandidate as StandardAction<any>;
        storeCandidate = new BaseReducerBuilder(storeCandidate.defaultValue).on(
          storeCandidate,
          identity2
        );
      } else if (typeof storeCandidate === "function") {
        // store candidate is regular reducer so we just wrap it
        const tmpReducer = new BaseReducerBuilder(null);
        tmpReducer.reducer = storeCandidate;
        storeCandidate = tmpReducer;
      }

      stores[el] = storeCandidate as BaseReducerBuilder<any>;
      stores[el].setPath(el);
      stores[el].parent = parent;
      reducersMap[el] = stores[el].reducer;
    });

    const nestedReducer = combineReducers(reducersMap);
    const plainReducer = this.reducer;
    this.reducer = (state, action) => {
      //@ts-ignore
      return plainReducer({...state, ...nestedReducer(state, action)}, action);
    };
  }
}
