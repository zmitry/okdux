"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createReducer_1 = require("./createReducer");
var shallowEquals_1 = require("./shallowEquals");
var changesTracker_1 = require("./changesTracker");
var identity = function (d) { return d; };
var Store = /** @class */ (function () {
    function Store(fn, watchNested) {
        if (fn === void 0) { fn = identity; }
        this.reactors = [];
        this.observers = [];
        this.root = false;
        this.initialized = false;
        this.selector = fn;
        this.watchNested = watchNested;
    }
    Store.prototype.getState = function () {
        return this.currentState;
    };
    Store.prototype.subscribe = function (fn) {
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
        var _this = this;
        if (this.root) {
            keys = this.getState() ? keys : changesTracker_1.getAllKeys(data);
            changesTracker_1.wrapKeys(keys, data);
        }
        var context = this[createReducer_1.ctxSymbol] && this[createReducer_1.ctxSymbol].context;
        var state = this.getState();
        var computedData;
        // @ts-ignore
        if (this.watchNested) {
            if (!this.changesTracker) {
                this.changesTracker = new changesTracker_1.ChangesTracker();
            }
            var fn = function () { return _this.selector(data, context); };
            computedData = this.changesTracker.compute(fn);
            if (!this.changesTracker.hasChanges(keys)) {
                return;
            }
        }
        else {
            computedData = this.selector(data, context);
        }
        if (!shallowEquals_1.shallowEquals(state, computedData)) {
            // this.currentState = computedData;
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