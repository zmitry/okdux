import { createComputed } from "../../../../";
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from "../constants/TodoFilters";
import { todosState } from "../state";

export const todosEntities = createComputed(todosState, s => s.todos);
export const visibilityFilter = createComputed(todosState, s => s.visibilityFilter);

const itemFilter = filter => item => {
  switch (filter) {
    case SHOW_ALL:
      return true;
    case SHOW_COMPLETED:
      return item.completed;
    case SHOW_ACTIVE:
      return !item.completed;
    default:
      throw new Error("Unknown filter: " + filter);
  }
};
export const visibleTodos = createComputed(
  todosEntities,
  visibilityFilter,
  (todos, visibilityFilter) => {
    return todos.filter(itemFilter(visibilityFilter));
  }
);

export const completedTodoCount = createComputed(todosEntities, todos => {
  return todos.reduce((count, todo) => (todo.completed ? count + 1 : count), 0);
});
