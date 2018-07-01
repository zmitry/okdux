"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reselect_1 = require("reselect");
var react_redux_1 = require("react-redux");
function createComputed() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var fn = args.pop();
    // @ts-ignore
    var selector = reselect_1.createSelector(args.map(function (el) { return el.select; }), fn);
    var connector = function (fn) {
        var connectSelector = reselect_1.createSelector(selector, function (_, p) { return p; }, function (state, props) { return fn(state, props); });
        return react_redux_1.connect(function (state, p) {
            //@ts-ignore
            return connectSelector(state, p);
        });
    };
    return {
        select: selector,
        connect: connector,
        use: function (fn) { return (connector = fn); }
    };
}
exports.createComputed = createComputed;
//# sourceMappingURL=selector.js.map