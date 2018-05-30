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
var lodash_1 = require("lodash");
var redux_1 = require("redux");
var object_path_immutable_1 = require("object-path-immutable");
var lens_1 = require("./lens");
// function isReducerBuilder(builder) {
//   return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
// }
var identity = function (d) {
    var _ = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        _[_i - 1] = arguments[_i];
    }
    return d;
};
var BaseReducerBuilder = /** @class */ (function () {
    function BaseReducerBuilder(initialState) {
        var _this = this;
        this.initialState = initialState;
        this.handlers = {};
        this.select = function (rs) {
            var path = _this.getPath();
            return path.length ? lodash_1.get(rs, _this.getPath()) : rs;
        };
        // @ts-ignore
        this.mapState = function (fn) {
            if (fn === void 0) { fn = identity; }
            return function (state, props) { return fn(_this.select(state), props, state); };
        };
        this.reducer = function (state, action) {
            if (state === void 0) { state = _this.initialState; }
            if (!action) {
                return state;
            }
            var type = action.type, payload = action.payload;
            var handlerObj = _this.handlers[type];
            if (handlerObj && handlerObj.handler) {
                if (handlerObj.lens) {
                    var path = handlerObj.lens(payload, lens_1.makeLens()).path;
                    var data = lodash_1.get(state, path);
                    if (data) {
                        var subres = handlerObj.handler(data, payload);
                        state = object_path_immutable_1.default.set(state, path, subres);
                    }
                }
                else {
                    var handler = _this.handlers[type].handler;
                    state = handler(state, payload, action);
                }
            }
            return state;
        };
        if (typeof initialState === "undefined") {
            throw new Error("initial state should not be undefined");
        }
        this.reducer = this.reducer.bind(this);
    }
    BaseReducerBuilder.prototype.setPath = function (path) {
        this.path = path;
    };
    BaseReducerBuilder.prototype.getPath = function () {
        if (this.parent) {
            return this.parent.getPath().concat(this.path);
        }
        else {
            return this.path ? [this.path] : [];
        }
    };
    // @ts-ignore
    BaseReducerBuilder.prototype.on = function (action, handlerOrLens, handler) {
        if (handler === void 0) { handler = null; }
        if (handler) {
            this.lens(action, handlerOrLens, handler);
            return this;
        }
        else {
            handler = handlerOrLens;
        }
        if (action === undefined || action === null || !action.getType) {
            throw new Error("action should be an action, got " + action);
        }
        this.handlers[action.getType()] = {
            handler: handler,
            action: action
        };
        return this;
    };
    BaseReducerBuilder.prototype.lens = function (action, lens, handler) {
        var propLens = lens_1.makeLens();
        this.handlers[action.getType()] = {
            handler: handler,
            lens: lens,
            action: action
        };
    };
    return BaseReducerBuilder;
}());
exports.BaseReducerBuilder = BaseReducerBuilder;
var CombinedReducer = /** @class */ (function (_super) {
    __extends(CombinedReducer, _super);
    function CombinedReducer(stores) {
        var _this = _super.call(this, {}) || this;
        _this.stores = stores;
        var parent = { getPath: _this.getPath.bind(_this) };
        Object.keys(stores).forEach(function (el) {
            var reducer = stores[el];
            // @ts-ignore
            if (reducer && reducer.getType) {
                // @ts-ignore
                reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, function (_, p) { return p; });
                stores[el] = reducer;
            }
            // @ts-ignore
            reducer.setPath(el);
            // @ts-ignore
            reducer.parent = parent;
        });
        // @ts-ignore
        var nestedReducer = redux_1.combineReducers(Object.keys(stores).reduce(function (acc, el) {
            // @ts-ignore
            acc[el] = stores[el].reducer;
            return acc;
        }, {}));
        var plainReducer = _this.reducer;
        // @ts-ignore
        _this.reducer = function (state, action) {
            if (state === void 0) { state = _this.initialState; }
            // @ts-ignore
            return plainReducer(nestedReducer(state, action), action);
        };
        return _this;
    }
    return CombinedReducer;
}(BaseReducerBuilder));
exports.CombinedReducer = CombinedReducer;
function createState(data) {
    return new BaseReducerBuilder(data);
}
exports.createState = createState;
function combineState(data) {
    return new CombinedReducer(data);
}
exports.combineState = combineState;
//# sourceMappingURL=createReducer.js.map