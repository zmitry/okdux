"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var lodash_1 = require("lodash");
var createReducer_1 = require("./createReducer");
function shallowEq(a, b) {
    if (Object.is(a, b)) {
        return true;
    }
    if (typeof a !== "object" || b === null || typeof a !== "object" || b === null) {
        return false;
    }
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (var i = 0; i < keysA.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(b, keysA[i]) ||
            !Object.is(a[keysA[i]], b[keysA[i]])) {
            return false;
        }
    }
    return true;
}
var trackedFn;
function checkKeyUsage(data, fn) {
    fn.deps = [];
    trackedFn = fn;
    var result = fn(data);
    trackedFn = null;
    var res = [result, fn.deps];
    fn.deps = null;
    return res;
}
exports.checkKeyUsage = checkKeyUsage;
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
    function Store(fn) {
        if (fn === void 0) { fn = identity; }
        var _this = this;
        this.reactors = [];
        this.observers = [];
        this.getState = function () {
            return _this.currentState;
        };
        this.subscribe = function (fn) {
            _this.reactors.push(fn);
            return function () { return _this.reactors.filter(function (el) { return !fn; }); };
        };
        this.getConsumer = function () {
            if (!_this._consumer) {
                _this._consumer = createConsumer(_this);
            }
            return _this._consumer;
        };
        this.use = function (_a) {
            var subscribe = _a.subscribe, getState = _a.getState;
            subscribe(function () {
                _this.set(getState(), createReducer_1.getKeys());
            });
        };
        this.addStore = function (store) {
            _this.observers.push(store);
        };
        this.map = function (fn) {
            var store = new Store(fn);
            _this.observers.push(store);
            return store;
        };
        this.set = function (data, keys) {
            wrapKeys(keys, data);
            var _a = checkKeyUsage(data, _this.selector), computedData = _a[0], deps = _a[1];
            var hasDeps = deps.length > 0;
            if (hasDeps || !shallowEq(_this.getState(), computedData)) {
                _this.currentState = computedData;
                _this.reactors.forEach(function (fn) { return fn(computedData); });
                _this.observers.forEach(function (el) {
                    el.set(computedData, keys);
                });
            }
        };
        this.callReactors = function (data) {
            _this.reactors.forEach(function (fn) { return fn(_this.selector(data)); });
        };
        this.selector = fn;
    }
    return Store;
}());
exports.Store = Store;
function compose() {
    var stores = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stores[_i] = arguments[_i];
    }
    var store = new Store();
    function reactor() {
        store.callReactors(stores.map(function (el) { return el.getState(); }));
    }
    stores.forEach(function (el) {
        el.react(reactor);
    });
    return store;
}
function createConsumer(store) {
    return _a = /** @class */ (function (_super) {
            __extends(StoreConsumer, _super);
            function StoreConsumer() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { currentState: store.getState() };
                return _this;
            }
            StoreConsumer.prototype.componentDidMount = function () {
                var _this = this;
                var unsub = store.subscribe(function (state) {
                    if (state !== _this.state.currentState) {
                        // @ts-ignore
                        _this.setState(function () { return ({ currentState: state }); });
                    }
                });
                this.unsub = unsub;
            };
            StoreConsumer.prototype.componentWillUnmount = function () {
                this.unsub();
            };
            StoreConsumer.prototype.render = function () {
                // @ts-ignore
                return this.props.children(this.state.currentState);
            };
            return StoreConsumer;
        }(react_1.default.Component)),
        _a.displayName = (store.displayName || "Store") + ".Consumer",
        _a;
    var _a;
}
exports.createConsumer = createConsumer;
//# sourceMappingURL=store.js.map