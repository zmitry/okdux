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
var react_1 = require("react");
var Consumer = /** @class */ (function (_super) {
    __extends(Consumer, _super);
    function Consumer(props) {
        var _this = _super.call(this, props) || this;
        //@ts-ignore
        _this.state = { currentState: props.source.getState() };
        return _this;
    }
    Consumer.prototype.componentDidMount = function () {
        var _this = this;
        // @ts-ignore
        this.unsub = this.props.source.subscribe(function (state) {
            // @ts-ignore
            if (state !== _this.state.currentState) {
                // @ts-ignore
                _this.setState({ currentState: state });
            }
        });
    };
    Consumer.prototype.componentWillUnmount = function () {
        this.unsub();
    };
    Consumer.prototype.render = function () {
        // @ts-ignore
        return this.props.children(this.state.currentState);
    };
    return Consumer;
}(react_1.default.Component));
exports.Consumer = Consumer;
//# sourceMappingURL=Consumer.js.map