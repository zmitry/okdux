import React from "react";
import { render } from "react-dom";
import { createStore } from "redux";
import App from "./components/App";
import { todosState } from "./state";
import "todomvc-app-css/index.css";
console.log("todosState: ", todosState);

const devtools = window.devToolsExtension ? window.devToolsExtension : () => fn => fn;

const store = createStore((...args) => todosState.reducer(...args), {}, devtools());
todosState.use(store);

render(<App />, document.getElementById("root"));
