"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
function local(state) {
    var reducer = state.reducer;
    var store = redux_1.createStore(reducer);
    state.use(store);
    return store;
}
exports.local = local;
//# sourceMappingURL=ministore.js.map