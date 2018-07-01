import TodoList from "../components/TodoList";
import { actions } from "../state";
import { visibleTodos } from "../selectors";

const VisibleTodoList = visibleTodos.connect(data => ({
  filteredTodos: data,
  actions
}))(TodoList);

export default VisibleTodoList;
