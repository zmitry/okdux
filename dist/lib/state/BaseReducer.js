import get from "lodash/get";
import { identity } from "./helpers";
export var reducerSymbol = Symbol();
export function isReducer(reducer) {
    return reducer && reducer[reducerSymbol];
}
var BaseReducerBuilder = /** @class */ (function () {
    function BaseReducerBuilder(initialState) {
        var _this = this;
        this.initialState = initialState;
        this.handlers = {};
        this[_a] = {};
        this.select = function (rs) {
            if (typeof rs === "function") {
                return _this.mapState(rs);
            }
            var path = _this.getPath();
            return path.length ? get(rs, _this.getPath()) : rs;
        };
        this.mapState = function (fn) {
            if (fn === void 0) { fn = identity; }
            return function (state, props) { return fn(_this.select(state), props, state); };
        };
        this.reset = function (action) {
            _this.on(action, function (state) { return _this.initialState; });
        };
        this.reducer = function (state, action) {
            if (state === void 0) { state = _this.initialState; }
            if (!action) {
                return state;
            }
            var type = action.type, payload = action.payload;
            var handlerObj = _this.handlers[type];
            if (handlerObj && handlerObj.handler) {
                var handler = _this.handlers[type].handler;
                state = handler(state, payload, action);
            }
            return state;
        };
        this.thru = function (fn) { return fn(_this); };
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
    BaseReducerBuilder.prototype.on = function (action, handler) {
        if (action === undefined || action === null || !action.getType) {
            throw new Error("action should be an action type, got " + action);
        }
        this.handlers[action.getType()] = {
            handler: handler,
            action: action
        };
        return this;
    };
    return BaseReducerBuilder;
}());
export { BaseReducerBuilder };
_a = reducerSymbol;
var _a;
//# sourceMappingURL=BaseReducer.js.map