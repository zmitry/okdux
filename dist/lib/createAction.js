"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createAction(type) {
    var action = function (payload) { return ({ type: type, payload: payload }); };
    var getType = function () { return type; };
    return Object.assign(action, { getType: getType });
}
exports.createAction = createAction;
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
exports.build = build;
function createActions(actions, prefix) {
    if (prefix === void 0) { prefix = "@"; }
    //@ts-ignore
    return Object.keys(actions).reduce(function (acc, el) {
        acc[el] = actions[el](prefix + "/" + el);
        return acc;
    }, {});
}
exports.createActions = createActions;
function createEffects(actions, prefix) {
    if (prefix === void 0) { prefix = "@"; }
    // @ts-ignore
    return createActions(actions, prefix);
}
exports.createEffects = createEffects;
//# sourceMappingURL=createAction.js.map