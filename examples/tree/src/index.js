import React from "react";
import { render } from "react-dom";
import { createStore } from "redux";
import generateTree from "./generateTree";
import { state } from "./state";
import Node from "./Node";

const tree = generateTree();

const devtools = window.devToolsExtension ? window.devToolsExtension : () => fn => fn;

const store = createStore((...args) => state.reducer(...args), tree, devtools());
state.use(store);

render(<Node id={0} />, document.getElementById("root"));
