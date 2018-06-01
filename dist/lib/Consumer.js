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
var React = require("react");
var Consumer = /** @class */ (function (_super) {
    __extends(Consumer, _super);
    function Consumer(props) {
        var _this = _super.call(this, props) || this;
        _this._hasUnmounted = false;
        if (props.selector) {
            _this.store = props.source.map(function (state) {
                return props.selector(state, _this.props || props);
            }, props.track);
            _this.state = { currentState: props.selector(props.source.getState()) };
        }
        else {
            _this.store = props.source;
            _this.state = { currentState: _this.store.getState() };
        }
        return _this;
    }
    Consumer.prototype.componentDidMount = function () {
        this.subscribe();
    };
    Consumer.prototype.componentWillUnmount = function () {
        this.unsubscribe();
        this._hasUnmounted = true;
    };
    Consumer.prototype.render = function () {
        // @ts-ignore
        return this.props.children(this.state.currentState);
    };
    Consumer.prototype.subscribe = function () {
        var _this = this;
        var callback = function (state) {
            if (_this._hasUnmounted) {
                return;
            }
            _this.setState({ currentState: state });
        };
        var unsubscribe = this.store.subscribe(callback);
        this._unsubscribe = unsubscribe;
    };
    Consumer.prototype.unsubscribe = function () {
        if (typeof this._unsubscribe === "function") {
            this._unsubscribe();
        }
        this._unsubscribe = null;
    };
    Consumer.displayName = "StoreConsumer";
    return Consumer;
}(React.PureComponent));
exports.Consumer = Consumer;
//# sourceMappingURL=Consumer.js.map