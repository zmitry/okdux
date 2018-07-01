import { createComputed } from "../../../../";
import MainSection from "../components/MainSection.js";
import { actions } from "../state";
import { completedTodoCount, todosEntities } from "../selectors";

const computed = createComputed(
  todosEntities,
  completedTodoCount,
  (todosEntities, completedCount) => ({
    todosCount: todosEntities.length,
    completedCount
  })
);

export default computed.connect(d => ({
  ...d,
  actions
}))(MainSection);
