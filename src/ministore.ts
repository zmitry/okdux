import { createStore } from "redux";
import { proxyState } from "proxyequal";

export function local(state) {
  const reducer = state.reducer;
  const store: any = createStore(reducer);
  store.context = store.dispatch;
  state.use(store);
  return store as any;
}
