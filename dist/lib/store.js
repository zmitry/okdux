"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createReducer_1 = require("./createReducer");
var shallowEquals_1 = require("./shallowEquals");
var changesTracker_1 = require("./changesTracker");
var identity = function (d) { return d; };
var Subscriber = /** @class */ (function () {
    function Subscriber() {
        this.reactors = [];
        this.observers = [];
    }
    Subscriber.prototype.subscribe = function (fn) {
        var _this = this;
        this.reactors.push(fn);
        return function () { return _this.reactors.filter(function (el) { return !fn; }); };
    };
    Subscriber.prototype.notify = function (computedData, keys) {
        this.reactors.forEach(function (fn) { return fn(computedData); });
        this.observers.forEach(function (el) {
            el.set(computedData, keys);
        });
    };
    return Subscriber;
}());
var SUBSCRIBE = 1;
var MAP = 2;
var COMPUTE = 3;
var graph = [];
var TYPES = {
    SINGLE_SHALLOW: 1,
    SINGLE_TRACK: 2,
    MULTI_TRACK: 3
};
var MultiTrack = /** @class */ (function () {
    function MultiTrack(_a) {
        var map = _a.map, _b = _a.mix, mix = _b === void 0 ? identity : _b;
        var _this = this;
        this.trackers = {};
        this.values = {};
        this.map = map;
        this.mix = mix;
        Object.keys(map).forEach(function (el) {
            _this.trackers[el] = new changesTracker_1.ChangesTracker();
        });
        this.keys = Object.keys(map);
    }
    MultiTrack.prototype.compute = function (data, changedKeys) {
        var _this = this;
        var res = this.keys.reduce(function (acc, el) {
            var fn = _this.map[el];
            if (_this.trackers[el].hasChanges(changedKeys)) {
                var value = _this.trackers[el].compute(function () { return fn(data, acc); });
                acc[el] = value;
                _this.values[el] = value;
            }
            return acc;
        }, Object.assign({}, this.values, this.mix(data)));
        return res;
    };
    return MultiTrack;
}());
exports.MultiTrack = MultiTrack;
var Store = /** @class */ (function () {
    function Store(data, type) {
        this.reactors = [];
        this.observers = [];
        this.root = false;
        this.initialized = false;
        this.type = TYPES.SINGLE_SHALLOW;
        this.type = type;
        if (type === TYPES.MULTI_TRACK) {
            this.computed = new MultiTrack(data);
        }
        else if (type === TYPES.SINGLE_TRACK) {
            this.changesTracker = new changesTracker_1.ChangesTracker();
        }
        else {
            this.selector = data || identity;
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
    };
    // @ts-ignore
    Store.prototype.compute = function (map, mix) {
        var store = new Store({ map: map, mix: mix }, TYPES.MULTI_TRACK);
        this.addStore(store);
        return store;
    };
    // @ts-ignore
    Store.prototype.map = function (fn, shouldWatchNested) {
        var type = shouldWatchNested ? TYPES.SINGLE_TRACK : TYPES.SINGLE_SHALLOW;
        var store = new Store(fn, type);
        this.addStore(store);
        return store;
    };
    Store.prototype.handleChanged = function (computedData, keys) {
        this.currentState = computedData;
        this.reactors.forEach(function (fn) { return fn(computedData); });
        this.observers.forEach(function (el) {
            el.set(computedData, keys);
        });
    };
    Store.prototype.run = function (data, keys, _a) {
        var _this = this;
        var context = _a.context;
        var computedData;
        switch (this.type) {
            case TYPES.SINGLE_TRACK:
                computedData = this.changesTracker.compute(function () { return _this.selector(data, context); });
                if (!this.changesTracker.hasChanges(keys)) {
                    return;
                }
                break;
            case TYPES.MULTI_TRACK:
                computedData = this.computed.compute(data, keys);
                break;
            default:
                computedData = this.selector(data, context);
                break;
        }
        if (shallowEquals_1.shallowEquals(this.getState(), computedData)) {
            return;
        }
        this.handleChanged(computedData, keys);
    };
    Store.prototype.set = function (data, keys) {
        if (this.root) {
            keys = this.getState() ? keys : changesTracker_1.getAllKeys(data);
            changesTracker_1.wrapKeys(keys, data);
        }
        var context = this[createReducer_1.ctxSymbol] && this[createReducer_1.ctxSymbol].context;
        this.run(data, keys, { context: context });
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