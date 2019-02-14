import { createAction } from "./createAction";
export function createApi(state, actionsDecl) {
    var actions = {};
    for (var actionKey in actionsDecl) {
        var handler = actionsDecl[actionKey];
        var act = createAction(Symbol(actionKey));
        state.on(act, handler);
        actions[actionKey] = act;
    }
    return actions;
}
//# sourceMappingURL=apiFactory.js.map