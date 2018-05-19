"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var create_subscription_1 = require("create-subscription");
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
        this.getValue = function () {
            return _this.currentValue;
        };
        this.react = function (fn) {
            _this.reactors.push(fn);
            return function () { return _this.reactors.filter(function (el) { return !fn; }); };
        };
        this.Consumer = create_subscription_1.createSubscription({
            getCurrentValue: this.getValue,
            subscribe: this.react
        });
        this.use = function (_a) {
            var subscribe = _a.subscribe, getState = _a.getState;
            subscribe(function () {
                _this.set(getState(), createReducer_1.getKeys());
            });
        };
        this.map = function (fn) {
            var store = new Store(fn);
            _this.observers.push(store);
            return store;
        };
        this.set = function (data, keys) {
            if (!_this[createReducer_1.reducerPathSymbol]) {
                wrapKeys(keys, data);
            }
            var _a = checkKeyUsage(data, _this.selector), computedData = _a[0], deps = _a[1];
            var hasDeps = deps.length > 0;
            if (hasDeps || !shallowEq(_this.currentValue, computedData)) {
                _this.currentValue = computedData;
                _this.reactors.forEach(function (fn) { return fn(computedData); });
                _this.observers.forEach(function (el) {
                    el.set(computedData, keys);
                });
            }
        };
        this.callReactors = function (data) {
            var computedData = _this.selector(data);
            _this.reactors.forEach(function (fn) { return fn(computedData); });
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
        store.callReactors(stores.map(function (el) { return el.getValue(); }));
    }
    stores.forEach(function (el) {
        el.react(reactor);
    });
    return store;
}
// export function createConsumer(store) {
//   return class Consumer extends React.Component {
//     state = {};
//     componentWillMount() {
//       this.unsub = store.react(el => {
//         this.setState({ state: el });
//       });
//     }
//     componentWillUnount() {
//       this.unsub();
//     }
//     render() {
//       return this.props.children(this.state.state);
//     }
//   };
// }
// console.log("policiesStore: ", policiesStore.tree());
//# sourceMappingURL=store.js.map