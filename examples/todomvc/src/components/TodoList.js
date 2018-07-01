import React from "react";
import PropTypes from "prop-types";
import TodoItem from "./TodoItem";

const TodoList = ({ filteredTodos, actions }) => (
  <ul className="todo-list">{filteredTodos.map(todo => <TodoItem todo={todo} {...actions} />)}</ul>
);

TodoList.propTypes = {
  filteredTodos: PropTypes.arrayOf(PropTypes.any).isRequired,
  actions: PropTypes.object.isRequired
};

export default TodoList;
