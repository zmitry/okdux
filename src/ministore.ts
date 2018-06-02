import { createStore } from "redux";
import { proxyState } from "proxyequal";

export function local(state) {
  const store: any = createStore((...args) => state.reducer(...args));
  state.use(store);
  return store as any;
}
