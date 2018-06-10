import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from "../constants/TodoFilters";
import { todosState } from "../state";

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
export const visibleTodos = todosState.map(({ todos, visibilityFilter }) =>
  todos.filter(itemFilter(visibilityFilter)).map(el => el.id)
);

export const completedTodoCount = todosState.map(el => el.todos).map(todos => {
  return todos.reduce((count, todo) => (todo.completed ? count + 1 : count), 0);
});
