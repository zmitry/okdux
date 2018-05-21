"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var createReducer_1 = require("./createReducer");
var shallowEquals_1 = require("./shallowEquals");
var trackedFn;
function checkKeyUsage(fn, data, context) {
    fn.deps = [];
    trackedFn = fn;
    var result = fn(data, context);
    trackedFn = null;
    var res = [result, fn.deps];
    fn.deps = null;
    return res;
}
exports.checkKeyUsage = checkKeyUsage;
function walkThrowKeys(data) {
    if (typeof data === "object") {
        for (var i in data) {
            walkThrowKeys(data[i]);
        }
    }
}
function wrapKeys(keys, data) {
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var keyPath = keys_1[_i];
        var path = keyPath.split(".");
        // eslint-disable-next-line
        path.reduce(function (parent, prop) {
            var obj = lodash_1.get(data, parent, data) || data;
            var valueProp = obj[prop];
            var pathToProp = parent.concat([prop]);
            if (typeof obj !== "object") {
                return pathToProp;
            }
            Reflect.defineProperty(obj, prop, {
                configurable: true,
                enumerable: true,
                get: function () {
                    trackedFn && trackedFn.deps.push(pathToProp.join("."));
                    return valueProp;
                }
            });
            return pathToProp;
        }, []);
    }
}
exports.wrapKeys = wrapKeys;
var identity = function (d) { return d; };
var Store = /** @class */ (function () {
    function Store(fn, watchNested) {
        if (fn === void 0) { fn = identity; }
        this.reactors = [];
        this.observers = [];
        this.root = false;
        this.deps = [];
        this.initialized = false;
        this.selector = fn;
        this.watchNested = watchNested;
    }
    Store.prototype.getState = function () {
        return this.currentState;
    };
    Store.prototype.subscribe = function (fn) {
        // if (!this.initialized) {
        //   this.use(local);
        // }
        var _this = this;
        this.reactors.push(fn);
        return function () { return _this.reactors.filter(function (el) { return !fn; }); };
    };
    Store.prototype.forEach = function (fn) {
        this.observers.forEach(function (el) {
            fn(el);
            el.forEach(fn);
        });
    };
    Store.prototype.use = function (dataOrFn) {
        var _this = this;
        if (typeof dataOrFn === "function") {
            return dataOrFn(this);
        }
        var subscribe = dataOrFn.subscribe, getState = dataOrFn.getState, context = dataOrFn.context;
        this.root = true;
        this.initialized = true;
        this[createReducer_1.ctxSymbol].context = context;
        this.forEach(function (el) {
            el[createReducer_1.ctxSymbol] = _this[createReducer_1.ctxSymbol];
            el.initialized = true;
        });
        var getKeys = this[createReducer_1.ctxSymbol].changesMonitor.getChangedKeys;
        subscribe(function () {
            _this.set(getState(), getKeys());
        });
        return dataOrFn;
    };
    Store.prototype.addStore = function (store) {
        this.observers.push(store);
        return store;
    };
    // @ts-ignore
    Store.prototype.map = function (fn, shouldWatchNested) {
        var store = new Store(fn, shouldWatchNested);
        return this.addStore(store);
    };
    Store.prototype.set = function (data, keys) {
        if (this.root) {
            wrapKeys(keys, data);
        }
        var context = this[createReducer_1.ctxSymbol] && this[createReducer_1.ctxSymbol].context;
        var state = this.getState();
        var _a = checkKeyUsage(this.selector, data, context), computedData = _a[0], deps = _a[1];
        // @ts-ignore
        if (this.watchNested) {
            this.deps = lodash_1.uniq(this.deps.concat(deps));
            if (this.deps.length > 0 && lodash_1.intersection(this.deps, keys).length === 0) {
                return;
            }
        }
        if (!shallowEquals_1.shallowEquals(state, computedData)) {
            this.currentState = computedData;
            this.reactors.forEach(function (fn) { return fn(computedData); });
            this.observers.forEach(function (el) {
                el.set(computedData, keys);
            });
        }
    };
    return Store;
}());
exports.Store = Store;
// function compose(...stores) {
//   const store = new Store();
//   function reactor() {
//     store.callReactors(stores.map(el => el.getState()));
//   }
//   stores.forEach(el => {
//     el.react(reactor);
//   });
//   return store;
// }
//# sourceMappingURL=store.js.map