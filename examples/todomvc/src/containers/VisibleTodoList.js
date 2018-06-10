import TodoList from "../components/TodoList";
import { connect, compose } from "../../../../";
import { actions } from "../state";
import { visibleTodos } from "../selectors";

const VisibleTodoList = connect(visibleTodos, data => ({
  filteredTodosIds: data,
  actions
}))(TodoList);

export default VisibleTodoList;
