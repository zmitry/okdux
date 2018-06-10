import Link from "../components/Link";

import { connect } from "../../../../";
import { todosState, actions } from "../state";

const visibilityFilter = todosState.map(el => el.visibilityFilter);

export default connect(visibilityFilter, (visibilityFilter, props) => ({
  active: props.filter === visibilityFilter,
  setFilter: () => actions.setVisibilityFilter(props.filter)
}))(Link);
