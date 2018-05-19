import { combineReducers } from 'redux';
import { get } from 'lodash';
import { createSubscription } from 'create-subscription';

var reducerPathSymbol = Symbol();
var keys = [];
var action;
var changedMonitor = {
    setChanged: function (newAction, key) {
        if (action !== newAction) {
            keys = [key];
            action = newAction;
        }
        else {
            keys.push(key);
        }
    }
};
var getKeys = function () { return keys; };
function getProp(object, keys) {
    keys = Array.isArray(keys) ? keys : keys.split(".");
    object = object[keys[0]];
    if (object && keys.length > 1) {
        return getProp(object, keys.slice(1));
    }
    return object;
}
function isReducerBuilder(builder) {
    return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
}
function traverseReducers(reducers, path) {
    for (var key in reducers) {
        var reducer = reducers[key];
        if (isReducerBuilder(reducer)) {
            reducer[reducerPathSymbol] = (path ? path + "." : "") + key;
        }
    }
}
var atomReducer = function (defaultV, type) { return function (state, action) {
    if (state === void 0) { state = defaultV; }
    return action && action.type === type ? action.payload : state;
}; };
var identityWithDefault = function (d) { return function (s) {
    if (s === void 0) { s = d; }
    return s;
}; };
function pruneInitialState(initialState) {
    return Object.keys(initialState).reduce(function (acc, el) {
        if (isReducerBuilder(initialState[el])) {
            acc.reducers[el] = initialState[el].buildReducer();
        }
        else if (initialState[el] && initialState[el].getType) {
            var t = initialState[el].getType();
            acc.reducers[el] = atomReducer(initialState[el].defaultValue, t);
        }
        else {
            acc.defaultState[el] = initialState[el];
            acc.reducers[el] = identityWithDefault(initialState[el]);
        }
        return acc;
    }, { reducers: {}, defaultState: {} });
}
var identity = function (d) {
    var _ = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        _[_i - 1] = arguments[_i];
    }
    return d;
};
function getDefaultReducer(initialState, path) {
    var defaultState = initialState;
    var nestedReducer = identity;
    if (typeof initialState === "object") {
        traverseReducers(initialState, path);
        var res = pruneInitialState(initialState);
        if (Object.keys(res.reducers).length !== 0) {
            // @ts-ignore
            nestedReducer = combineReducers(res.reducers);
        }
        defaultState = res.defaultState;
    }
    return { nestedReducer: nestedReducer, defaultState: defaultState };
}
var ReducerBuilder = /** @class */ (function () {
    function ReducerBuilder(initialState) {
        var _this = this;
        this.initialState = initialState;
        this.handlers = {};
        this[_a] = "";
        this.select = function (rs) {
            if (_this[reducerPathSymbol]) {
                return getProp(rs, _this[reducerPathSymbol]);
            }
            else {
                return rs;
            }
        };
        // @ts-ignore
        this.mapState = function (fn) {
            return function (state, props) { return fn(_this.select(state), props, state); };
        };
    }
    // @ts-ignore
    ReducerBuilder.prototype.on = function (action, handler) {
        if (action === undefined || action === null || !action.getType) {
            throw new Error("action should be an action, got " + action);
        }
        this.handlers[action.getType()] = handler;
        return this;
    };
    // @ts-ignore
    ReducerBuilder.prototype.handle = function (type, handler) {
        var _this = this;
        if (Array.isArray(type)) {
            type.forEach(function (t) { return _this.handle(t, handler); });
        }
        else {
            this.handlers[type] = handler;
        }
        return this;
    };
    Object.defineProperty(ReducerBuilder.prototype, "reducer", {
        get: function () {
            return this._reducer;
        },
        enumerable: true,
        configurable: true
    });
    ReducerBuilder.prototype.buildReducer = function (path) {
        var _this = this;
        if (path) {
            this[reducerPathSymbol] = path;
        }
        var _a = getDefaultReducer(this.initialState, this[reducerPathSymbol] || path), defaultState = _a.defaultState, nestedReducer = _a.nestedReducer;
        var reducer = function (state, action) {
            if (state === void 0) { state = defaultState; }
            state = nestedReducer(state, action);
            if (!action) {
                return state;
            }
            var type = action.type, payload = action.payload;
            if (_this.handlers[type]) {
                var handler = _this.handlers[type];
                var nextState = handler(state, payload, action);
                if (nextState !== state) {
                    changedMonitor.setChanged(action, _this[reducerPathSymbol]);
                }
                state = nextState;
            }
            return state;
        };
        this._reducer = reducer;
        return reducer;
    };
    return ReducerBuilder;
}());
_a = reducerPathSymbol;
var _a;

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
function wrapKeys(keys, data) {
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var keyPath = keys_1[_i];
        var path = keyPath.split(".");
        // eslint-disable-next-line
        path.reduce(function (parent, prop) {
            var obj = get(data, parent, data) || data;
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
var identity$1 = function (d) { return d; };
var Store = /** @class */ (function () {
    function Store(fn) {
        if (fn === void 0) { fn = identity$1; }
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
        this.Consumer = createSubscription({
            getCurrentValue: this.getValue,
            subscribe: this.react
        });
        this.use = function (_a) {
            var subscribe = _a.subscribe, getState = _a.getState;
            subscribe(function () {
                _this.set(getState(), getKeys());
            });
        };
        this.map = function (fn) {
            var store = new Store(fn);
            _this.observers.push(store);
            return store;
        };
        this.set = function (data, keys) {
            if (!_this[reducerPathSymbol]) {
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

function createAction(type) {
    var action = function (payload) { return ({ type: type, payload: payload }); };
    var getType = function () { return type; };
    return Object.assign(action, { getType: getType });
}
function createAsyncAction(name) {
    return {
        request: createAction(name + "_REQUEST"),
        success: createAction(name + "_SUCCESS"),
        failure: createAction(name + "_FAILURE")
    };
}
var build = {
    plain: createAction,
    action: function () {
        // @ts-ignore
        return createAction(name);
    },
    mutator: function (defaultValue) { return function (name) {
        var action = function (data) {
            if (data === void 0) { data = defaultValue; }
            return ({ type: name, payload: data });
        };
        action.defaultValue = defaultValue;
        action.getType = function () { return name; };
        return action;
    }; },
    async: function () { return function (name) {
        return createAsyncAction(name);
    }; }
};
function createActions(actions, prefix) {
    if (prefix === void 0) { prefix = "@"; }
    //@ts-ignore
    return Object.keys(actions).reduce(function (acc, el) {
        acc[el] = actions[el](prefix + "/" + el);
        return acc;
    }, {});
}
function createEffects(actions, prefix) {
    if (prefix === void 0) { prefix = "@"; }
    // @ts-ignore
    return createActions(actions, prefix);
}

function createState(initialState) {
    if (initialState === undefined) {
        throw new Error("initial state cannot be undefined");
    }
    var reducer = new ReducerBuilder(initialState);
    var store = new Store(reducer.select);
    var res = Object.assign(reducer, store);
    // @ts-ignore
    return res;
}

export { createState, reducerPathSymbol, getKeys, ReducerBuilder, createAction, build, createActions, createEffects, checkKeyUsage, wrapKeys, Store };
