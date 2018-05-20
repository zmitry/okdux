import React from "react";

export class Consumer extends React.Component<any, { currentState: any }> {
  constructor(props) {
    super(props);
    this.state = { currentState: props.source.getState() };
  }
  // @ts-ignore
  unsub;
  componentDidMount() {
    // @ts-ignore
    this.unsub = this.props.source.subscribe(state => {
      // @ts-ignore
      if (state !== this.state.currentState) {
        // @ts-ignore
        this.setState({ currentState: state });
      }
    });
  }
  componentWillUnmount() {
    this.unsub();
  }
  render() {
    // @ts-ignore
    return this.props.children(this.state.currentState);
  }
}
