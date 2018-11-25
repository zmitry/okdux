import { CombinedReducer, BaseReducerBuilder, getRootStateSymbol } from "./state";
export function createState(initialState) {
    if (initialState === undefined) {
        throw new Error("initial state cannot be undefined");
    }
    var state;
    if (initialState && typeof initialState === "object") {
        var firstKey = Object.keys(initialState)[0];
        if (initialState[firstKey] &&
            (initialState[firstKey].reducer ||
                initialState[firstKey].getType ||
                typeof initialState[firstKey] === "function")) {
            // @ts-ignore
            state = new CombinedReducer(initialState);
        }
        else {
            state = new BaseReducerBuilder(initialState);
        }
    }
    else {
        state = new BaseReducerBuilder(initialState);
    }
    state.use = function (d, gs) { return use(state, d, gs); };
    state.createStore = function (fn) {
        var store = fn(state.reducer, state);
        if (!store) {
            throw new Error("you must return store from createStore method");
        }
        use(state, store.dispatch);
    };
    return state;
}
function forEachStore(stores, fn) {
    for (var item in stores) {
        if (stores[item]) {
            fn(stores[item]);
            if (stores[item].stores) {
                forEachStore(stores[item].stores, fn);
            }
        }
    }
}
function forEachAction(store, fn) {
    for (var item in store.handlers) {
        fn(store.handlers[item]);
    }
}
function use(store, dispatch, getState) {
    if (getState === void 0) { getState = null; }
    var setDispatch = function (data) {
        data.action.setDispatch(dispatch);
    };
    forEachAction(store, setDispatch);
    store[getRootStateSymbol] = getState;
    forEachStore(store.stores, function (el) {
        el[getRootStateSymbol] = getState;
        forEachAction(el, setDispatch);
    });
}
export * from "./action";
//# sourceMappingURL=index.js.map