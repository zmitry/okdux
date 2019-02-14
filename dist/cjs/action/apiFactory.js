"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var createAction_1 = require("./createAction");
function createApi(state, actionsDecl) {
    var update = createAction_1.createAction(Symbol("update"));
    state.on(update, function (s, p) { return (__assign({}, state, p)); });
    var actions = { update: update };
    for (var actionKey in actionsDecl) {
        var handler = actionsDecl[actionKey];
        var act = createAction_1.createAction(Symbol(actionKey));
        state.on(act, handler);
        actions[actionKey] = act;
    }
    return actions;
}
exports.createApi = createApi;
//# sourceMappingURL=apiFactory.js.map