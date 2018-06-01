import React, { Component, PureComponent } from "react";

import { Consumer } from "../../../";
import { state, events } from "./state";

export class Node extends PureComponent {
  handleIncrementClick = () => {
    const { id } = this.props;
    events.increment(id);
  };

  handleAddChildClick = e => {
    e.preventDefault();

    const { id } = this.props;
    const childId = Math.ceil(Math.random() * 300) + 1000;
    events.createNode(childId);
    events.addChild({ id, childId });
  };

  handleRemoveClick = e => {
    e.preventDefault();

    const { parentId, id } = this.props;
    events.removeChild({ id: parentId, childId: id });
    events.deleteNode(id);
  };

  renderChild = childId => {
    const { id } = this.props;
    return (
      <li key={childId}>
        <Node id={childId} parentId={id} />
      </li>
    );
  };

  render() {
    const { parentId, id } = this.props;
    return (
      <Consumer
        source={state}
        selector={data => {
          return { item: { ...data[id] } };
        }}
        track
      >
        {({ item }) => {
          const { counter, childIds } = item;
          return (
            <div>
              Counter: {counter} <button onClick={this.handleIncrementClick}>+</button>{" "}
              {typeof parentId !== "undefined" && (
                <a
                  href="#"
                  onClick={this.handleRemoveClick} // eslint-disable-line jsx-a11y/href-no-hash
                  style={{ color: "lightgray", textDecoration: "none" }}
                >
                  ×
                </a>
              )}
              <ul>
                {childIds.map(this.renderChild)}
                <li key="add">
                  <a
                    href="#" // eslint-disable-line jsx-a11y/href-no-hash
                    onClick={this.handleAddChildClick}
                  >
                    Add child
                  </a>
                </li>
              </ul>
            </div>
          );
        }}
      </Consumer>
    );
  }
}

export default Node;
