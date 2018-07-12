import { createState as state, combineState } from "./createReducer";
export function createState(initialState) {
    if (initialState === undefined) {
        throw new Error("initial state cannot be undefined");
    }
    var reducer;
    if (typeof initialState === "object") {
        var firstKey = Object.keys(initialState)[0];
        if (initialState[firstKey] &&
            (initialState[firstKey].reducer ||
                initialState[firstKey].getType ||
                typeof initialState[firstKey] === "function")) {
            // @ts-ignore
            reducer = combineState(initialState);
        }
        else {
            reducer = state(initialState);
        }
    }
    else {
        reducer = state(initialState);
    }
    reducer.use = function (dispatch) { return use(reducer, dispatch); };
    return reducer;
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
var reducer = function (state, action) {
    if (state === void 0) { state = { user: "qwer" }; }
    return state;
};
var st = createState({
    reducer: reducer
});
function forEachAction(store, fn) {
    for (var item in store.handlers) {
        fn(store.handlers[item]);
    }
}
function use(store, dispatch) {
    var setDispatch = function (data) {
        data.action.setDispatch(dispatch);
    };
    forEachAction(store, setDispatch);
    forEachStore(store.stores, function (el) {
        forEachAction(el, setDispatch);
    });
}
export * from "./createAction";
//# sourceMappingURL=index.js.map