"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var shallowEquals_1 = require("./shallowEquals");
var changesTracker_1 = require("./changesTracker");
var identity = function (d) { return d; };
var TYPES = {
    SINGLE_SHALLOW: 1,
    SINGLE_TRACK: 2,
    MULTI_TRACK: 3
};
function mergeKeys(data, store) {
    var _loop_1 = function (action) {
        var actionInfo = store.handlers[action];
        var existingPaths = data[action];
        data[action] = existingPaths
            ? __spread(existingPaths, [store.getPath().join(".")]) : [store.getPath().join(".")];
        if (actionInfo && actionInfo.lens) {
            data[action].push(function (action) {
                return __spread(store.getPath(), actionInfo.lens(action)).join(".");
            });
        }
    };
    for (var action in store.handlers) {
        _loop_1(action);
    }
}
function forEachStore(stores, fn) {
    for (var item in stores) {
        if (stores[item]) {
            fn(stores[item]);
            if (stores[item].stores) {
                fn(stores[item].stores);
            }
        }
    }
}
function forEachAction(store, fn) {
    for (var item in store.handlers) {
        fn(store.handlers[item]);
    }
}
var Store = /** @class */ (function () {
    function Store(data, type) {
        if (type === void 0) { type = TYPES.SINGLE_SHALLOW; }
        this.reactors = [];
        this.observers = [];
        this.keys = {};
        this.root = false;
        this.initialized = false;
        this.computed = false;
        this.type = TYPES.SINGLE_SHALLOW;
        this.type = type;
        // @ts-ignore
        this.compose = compose.bind(null, this);
        this.selector = data || identity;
        if (type === TYPES.SINGLE_TRACK) {
            this.changesTracker = new changesTracker_1.ChangesTracker();
        }
    }
    Store.prototype.getState = function () {
        return this.currentState;
    };
    Store.prototype.subscribe = function (fn) {
        var _this = this;
        this.reactors.push(fn);
        return function () { return _this.reactors.filter(function (el) { return !fn; }); };
    };
    Store.prototype.use = function (dataOrFn) {
        var _this = this;
        // @ts-ignore
        var origReducer = this.reducer;
        // @ts-ignore
        this.reducer = function (state, action) {
            var res = origReducer(state, action);
            // @ts-ignore
            _this.changedAction = action;
            return res;
        };
        if (typeof dataOrFn === "function") {
            return dataOrFn(this);
        }
        var subscribe = dataOrFn.subscribe, getState = dataOrFn.getState, dispatch = dataOrFn.dispatch;
        this.root = true;
        this.initialized = true;
        // this[ctxSymbol].context = context;
        //
        mergeKeys(this.keys, this);
        forEachAction(this, function (data) {
            data.action._dispatchers.add(dispatch);
        });
        // @ts-ignore
        forEachStore(this.stores, function (el) {
            // el[ctxSymbol] = this[ctxSymbol];
            mergeKeys(_this.keys, el);
            forEachAction(el, function (data) {
                data.action._dispatchers.add(dispatch);
            });
            _this.addStore(el);
            el.initialized = true;
        });
        // const getKeys = this[ctxSymbol].changesMonitor.getChangedKeys;
        var getKeys = function (keys, action) {
            if (!action || !action.type || !keys[action.type]) {
                return [];
            }
            return keys[action.type]
                .map(function (el) {
                if (typeof el === "function") {
                    return el(action.payload);
                }
                return el;
            })
                .filter(function (el) { return !!el; });
        };
        subscribe(function () {
            // @ts-ignore
            _this.set(getState(), getKeys(_this.keys, _this.changedAction));
        });
        dispatch({ type: "init" });
        return dataOrFn;
    };
    Store.prototype.addStore = function (store) {
        this.observers.push(store);
    };
    // @ts-ignore
    Store.prototype.map = function (fn, shouldWatchNested) {
        var type = shouldWatchNested ? TYPES.SINGLE_TRACK : TYPES.SINGLE_SHALLOW;
        var store = new Store(fn, type);
        this.addStore(store);
        return store;
    };
    Store.prototype.handleChanged = function (computedData, keys) {
        this.computed = true;
        this.currentState = computedData;
        this.observers.forEach(function (el) { return el.run && el.run(computedData, keys); });
        this.reactors.forEach(function (fn) { return fn(computedData); });
    };
    Store.prototype.run = function (data, keys) {
        var _this = this;
        var computedData;
        switch (this.type) {
            case TYPES.SINGLE_TRACK:
                computedData = this.changesTracker.compute(function () { return _this.selector(data); });
                if (!this.changesTracker.hasChanges(keys) && this.computed) {
                    return;
                }
                break;
            default:
                computedData = this.selector(data);
                break;
        }
        if (shallowEquals_1.shallowEquals(this.getState(), computedData)) {
            return;
        }
        this.handleChanged(computedData, keys);
    };
    Store.prototype.set = function (data, keys) {
        if (this.root) {
            // keys = this.getState() ? keys : getAllKeys(data);
            // wrapKeys(keys, data);
        }
        this.run(data, keys);
    };
    return Store;
}());
exports.Store = Store;
function compose() {
    var stores = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stores[_i] = arguments[_i];
    }
    var fn = stores.pop();
    var store = new Store(fn, TYPES.SINGLE_TRACK);
    function reactor() {
        // @ts-ignore
        if (stores.find(function (el) { return !el.computed; })) {
            return;
        }
        // @ts-ignore
        store.handleChanged(fn(stores.map(function (el) { return el.getState(); })), []);
    }
    stores.forEach(function (el) {
        // @ts-ignore
        el.subscribe(reactor);
    });
    return store;
}
exports.compose = compose;
// function computed(...stores) {
//   const computeObj = stores.pop();
//   compose(...stores, (data)=>{
//     return {
//     }
//   })
//   const store = new Store();
// }
//# sourceMappingURL=store.js.map