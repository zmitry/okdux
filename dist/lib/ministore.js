"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
function local(state) {
    var reducer = state.buildReducer();
    var store = redux_1.createStore(reducer);
    store.context = store.dispatch;
    state.use(store);
    return store;
}
exports.local = local;
//# sourceMappingURL=ministore.js.map