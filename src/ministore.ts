import { createStore } from "redux";

export function local(state) {
  const reducer = state.buildReducer();
  const store: any = createStore(reducer);
  store.context = store.dispatch;
  state.use(store);
  return store as any;
}
