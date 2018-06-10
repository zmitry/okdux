import React from "react";
import PropTypes from "prop-types";
import TodoItem from "./TodoItem";
import { Consumer } from "../../../../";
import { todosState } from "../state";

const todos = todosState.map(el => el.todos);

const TodoList = ({ filteredTodosIds, actions }) => (
  <ul className="todo-list">
    {filteredTodosIds.map(todo => (
      <Consumer
        key={todo}
        source={todos}
        selector={todos => {
          return todos.find(el => el.id === todo);
        }}
      >
        {todo => {
          return <TodoItem todo={todo} {...actions} />;
        }}
      </Consumer>
    ))}
  </ul>
);

TodoList.propTypes = {
  filteredTodosIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  actions: PropTypes.object.isRequired
};

export default TodoList;
