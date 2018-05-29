import { createStore } from "redux";
import { proxyState } from "proxyequal";

export function local(state) {
  const reducer = state.reducer;
  const store: any = createStore(reducer);
  state.use(store);
  return store as any;
}
