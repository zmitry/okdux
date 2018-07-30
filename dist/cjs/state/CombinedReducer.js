"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var helpers_1 = require("./helpers");
var BaseReducer_1 = require("./BaseReducer");
var CombinedReducer = /** @class */ (function (_super) {
    __extends(CombinedReducer, _super);
    function CombinedReducer(storesToParse) {
        var _this = _super.call(this, {}) || this;
        var parent = { getPath: _this.getPath.bind(_this) };
        var stores = {};
        var reducersMap = {};
        _this.stores = stores;
        Object.keys(storesToParse).forEach(function (el) {
            var storeCandidate = storesToParse[el];
            if (storeCandidate && storeCandidate.getType) {
                // store candidate is action with default value so we transform it to reducer
                storeCandidate = storeCandidate;
                storeCandidate = new BaseReducer_1.BaseReducerBuilder(storeCandidate.defaultValue).on(storeCandidate, helpers_1.identity2);
            }
            else if (typeof storeCandidate === "function") {
                // store candidate is regular reducer so we just wrap it
                var tmpReducer = new BaseReducer_1.BaseReducerBuilder(null);
                tmpReducer.reducer = storeCandidate;
                storeCandidate = tmpReducer;
            }
            stores[el] = storeCandidate;
            stores[el].setPath(el);
            stores[el].parent = parent;
            reducersMap[el] = stores[el].reducer;
        });
        var nestedReducer = redux_1.combineReducers(reducersMap);
        var plainReducer = _this.reducer;
        _this.reducer = function (state, action) {
            //@ts-ignore
            return plainReducer(nestedReducer(state, action), action);
        };
        return _this;
    }
    return CombinedReducer;
}(BaseReducer_1.BaseReducerBuilder));
exports.CombinedReducer = CombinedReducer;
//# sourceMappingURL=CombinedReducer.js.map