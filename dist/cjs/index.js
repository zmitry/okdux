"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var createReducer_1 = require("./createReducer");
function createState(initialState) {
    if (initialState === undefined) {
        throw new Error("initial state cannot be undefined");
    }
    var reducer;
    if (typeof initialState === "object") {
        var firstKey = Object.keys(initialState)[0];
        if (initialState[firstKey] &&
            (initialState[firstKey].reducer || initialState[firstKey].getType)) {
            // @ts-ignore
            reducer = createReducer_1.combineState(initialState);
        }
        else {
            reducer = createReducer_1.createState(initialState);
        }
    }
    else {
        reducer = createReducer_1.createState(initialState);
    }
    reducer.use = function (dispatch) { return use(reducer, dispatch); };
    return reducer;
}
exports.createState = createState;
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
function use(store, dispatch) {
    var setDispatch = function (data) {
        data.action.setDispatch(dispatch);
    };
    forEachAction(store, setDispatch);
    forEachStore(store.stores, function (el) {
        forEachAction(el, setDispatch);
    });
}
__export(require("./createAction"));
//# sourceMappingURL=index.js.map