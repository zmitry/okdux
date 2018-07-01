import Link from "../components/Link";

import { actions } from "../state";
import { visibilityFilter } from "../selectors";

export default visibilityFilter.connect((visibilityFilter, props) => ({
  active: props.filter === visibilityFilter,
  setFilter: () => actions.setVisibilityFilter(props.filter)
}))(Link);
