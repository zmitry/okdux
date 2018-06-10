import { connect, compose } from "../../../../";
import MainSection from "../components/MainSection.js";
import { todosState, actions } from "../state";
import { completedTodoCount } from "../selectors";

const todosLen = todosState.map(el => el.todos).map(el => el.length);

const data = todosLen.compose(completedTodoCount, ([todosCount, completedCount]) => {
  return {
    todosCount,
    completedCount
  };
});

export default connect(data, d => ({
  ...d,
  actions
}))(MainSection);
