"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createAction_1 = require("./createAction");
function createApi(state, actionsDecl) {
    var actions = {};
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