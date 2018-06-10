import * as React from "react";
import { Store } from "./store";

export class Consumer extends React.PureComponent<
  { children: any; source: any; selector: any },
  { currentState: any }
> {
  static displayName = "StoreConsumer";
  state: { currentState: any };

  _unsubscribe: Function;
  _hasUnmounted: boolean = false;
  propStore: any;
  store: any;

  constructor(props) {
    super(props);
    if (props.selector) {
      this.store = props.source.map(state => {
        return props.selector(state, this.props || props);
      }, props.track);
      this.state = { currentState: props.selector(props.source.getState(), props) };
    } else {
      this.store = props.source;
      this.state = { currentState: this.store.getState() };
    }
  }

  componentDidMount() {
    this.subscribe();
  }
  componentWillUnmount() {
    this.unsubscribe();
    this._hasUnmounted = true;
  }
  render() {
    // @ts-ignore
    return this.props.children(this.state.currentState);
  }

  subscribe() {
    const callback = (state: any) => {
      if (this._hasUnmounted) {
        return;
      }

      this.setState({ currentState: state });
    };

    const unsubscribe = this.store.subscribe(callback);

    this._unsubscribe = unsubscribe;
  }
  unsubscribe() {
    if (typeof this._unsubscribe === "function") {
      this._unsubscribe();
    }

    this._unsubscribe = null;
  }
}

export function connect(store, selector) {
  return Component => {
    return props => {
      return (
        <Consumer source={store} selector={selector} {...props}>
          {data => <Component {...props} {...data} />}
        </Consumer>
      );
    };
  };
}
