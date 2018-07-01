import { createActions, createState, build } from "../../../../";
import { SHOW_ALL } from "../constants/TodoFilters";

export const actions = createActions({
  addTodo: build.plain,
  deleteTodo: build.plain,
  editTodo: build.plain,
  completeTodo: build.plain,
  completeAllTodos: build.plain,
  clearCompleted: build.plain,
  setVisibilityFilter: build.mutator(SHOW_ALL)
});

const initialState = [
  {
    text: "Use Redux",
    completed: false,
    id: 0
  }
];

export const todos = createState(initialState)
  .on(actions.addTodo, (state, text) => [
    ...state,
    {
      id: state.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: false,
      text: text
    }
  ])
  .on(actions.clearCompleted, state => state.filter(todo => todo.completed === false))
  .on(actions.completeAllTodos, state => {
    const areAllMarked = state.every(todo => todo.completed);
    return state.map(todo => ({
      ...todo,
      completed: !areAllMarked
    }));
  })
  .on(actions.deleteTodo, (state, id) => state.filter(todo => todo.id !== id))
  .on(actions.editTodo, (state, { id, text }) =>
    state.map(el => (el.id === id ? { ...el, text } : el))
  )
  .on(actions.completeTodo, (state, id) =>
    state.map(el => (el.id === id ? { ...el, completed: !el.completed } : el))
  );

export const todosState = createState({
  todos,
  visibilityFilter: actions.setVisibilityFilter
});
