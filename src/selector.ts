import { createSelector } from "reselect";
import { connect } from "react-redux";

export function createComputed(...args) {
  const fn = args.pop();
  // @ts-ignore
  const selector = createSelector(args.map(el => el.select), fn);
  let connector = fn => connect(state => fn(selector(state)));
  return {
    select: selector,
    connect: connector,
    use: fn => (connector = fn)
  };
}
