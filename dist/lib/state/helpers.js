export var identity = function (d) {
    var _ = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        _[_i - 1] = arguments[_i];
    }
    return d;
};
export var didentity = function (defaultV) { return function (d) {
    if (d === void 0) { d = defaultV; }
    var _ = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        _[_i - 1] = arguments[_i];
    }
    return d;
}; };
export var identity2 = function (_, d) { return d; };
//# sourceMappingURL=helpers.js.map