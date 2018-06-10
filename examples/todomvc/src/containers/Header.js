import React from "react";
import { actions } from "../state";
import TodoTextInput from "../components/TodoTextInput";

export const Header = () => (
  <header className="header">
    <h1>todos</h1>
    <TodoTextInput
      newTodo
      onSave={text => {
        if (text.length !== 0) {
          actions.addTodo(text);
        }
      }}
      placeholder="What needs to be done?"
    />
  </header>
);

export default Header;
