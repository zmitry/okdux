import { createSelector } from "reselect";
import { connect } from "react-redux";

export function createComputed(...args) {
  const fn = args.pop();
  // @ts-ignore
  const selector = createSelector(args.map(el => el.select), fn);
  let connector = fn => {
    const connectSelector = createSelector(
      selector,
      (_, p) => p,
      (state, props) => fn(state, props)
    );
    return connect((state, p) => {
      //@ts-ignore
      return connectSelector(state, p);
    });
  };
  return {
    select: selector,
    connect: connector,
    use: fn => (connector = fn)
  };
}
