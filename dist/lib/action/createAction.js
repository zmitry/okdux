var mutator = function (defaultValue) { return function (name) {
    if (name === void 0) { name = Symbol(); }
    var dispatch = null;
    var actionRaw = function (data) {
        if (data === void 0) { data = defaultValue; }
        return { type: name, payload: data };
    };
    var action = function (data) {
        if (data === void 0) { data = defaultValue; }
        var action = actionRaw(data);
        dispatch && dispatch(action);
        return action;
    };
    var actionMeta = {
        getType: function () { return name; },
        defaultValue: defaultValue,
        setDispatch: function (d) {
            dispatch = d;
        },
        getDispatch: function () { return dispatch; },
        raw: actionRaw
    };
    return Object.assign(action, actionMeta);
}; };
var createAction = mutator(null);
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
        return function (name) { return createAction(name); };
    },
    mutator: mutator,
    async: function () { return function (name) {
        return createAsyncAction(name);
    }; }
};
function createActions(actions, prefix) {
    if (prefix === void 0) { prefix = "@"; }
    return Object.keys(actions).reduce(function (acc, el) {
        acc[el] = actions[el](prefix + "/" + el);
        return acc;
    }, {});
}
var createEffects = createActions;
export { createAction, build, createActions, createEffects };
//# sourceMappingURL=createAction.js.map