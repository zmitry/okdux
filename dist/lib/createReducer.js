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
var identity2 = function (_, d) { return d; };
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
                    var path = handlerObj.lens(payload);
                    var data = lodash_1.get(state, path);
                    if (typeof data !== "undefined") {
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
    function CombinedReducer(storesToParse) {
        var _this = _super.call(this, {}) || this;
        var parent = { getPath: _this.getPath.bind(_this) };
        var stores = {};
        var reducersMap = {};
        _this.stores = stores;
        Object.keys(storesToParse).forEach(function (el) {
            var reducer = storesToParse[el];
            if (reducer && reducer.getType) {
                reducer = reducer;
                reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, identity2);
            }
            stores[el] = reducer;
            stores[el].setPath(el);
            stores[el].parent = parent;
            reducersMap[el] = stores[el].reducer;
        });
        var nestedReducer = redux_1.combineReducers(reducersMap);
        var plainReducer = _this.reducer;
        _this.reducer = function (state, action) {
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