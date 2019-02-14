"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var state_1 = require("./state");
function createState(initialState) {
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
            state = new state_1.CombinedReducer(initialState);
        }
        else {
            state = new state_1.BaseReducerBuilder(initialState);
        }
    }
    else {
        state = new state_1.BaseReducerBuilder(initialState);
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
    try {
        for (var _a = __values(Object.getOwnPropertySymbols(store.handlers)), _b = _a.next(); !_b.done; _b = _a.next()) {
            var item = _b.value;
            fn(store.handlers[item]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var e_1, _c;
}
function use(store, dispatch, getState) {
    if (getState === void 0) { getState = null; }
    var setDispatch = function (data) {
        data.action.setDispatch(dispatch);
    };
    forEachAction(store, setDispatch);
    store[state_1.getRootStateSymbol] = getState;
    forEachStore(store.stores, function (el) {
        el[state_1.getRootStateSymbol] = getState;
        forEachAction(el, setDispatch);
    });
}
__export(require("./action"));
//# sourceMappingURL=index.js.map