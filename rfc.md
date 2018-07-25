```jsx
const i = createState(1);
const state = createState({
  i
});

state.use(store.dispatch, store.getState, store.subscribe);

i.subscribe(() => {});
i.getState();
state.getState();

const stateSelector = createComputed(state, () => state);
<stateSelector.Consumer selector={state => state.i} />;
stateSelector.connect();

const { from } = require("most");
const asyncAction = createAsync("qwer");
const cancel = createAsync("qwer2");

const cancelStream = from(cancel);
from(asyncAction)
  .mergeMap(el => rxfetch().takeUntil(cancelStream))
  .subscribe(el => {
    asyncAction.success(el);
  });
```

```js
const effect = createEffect();

const searchUsers = ({ request, cancel, success }) => (action$, state$) =>
  request
    .select(action$)
    .map(toQuery)
    .filter(whereNotEmpty)
    .map(query =>
      just()
        .until(cancel.select($action))
        .chain(_ =>
          merge(
            just(replaceQuery(query)),
            fromPromise(fetch(getUsersQueryUrl(query)).then(response => response.json()))
              .map(toItems)
              .map(success.raw)
          )
        )
    )
    .switch();

effect.useEpic(searchUsers);
```

```js
import { routerReducer } from "router-store";

const routerReducerEnhanced = (state, action) => {
  const nextRouterState = routerReducer(state.router, action);
  if (nextState === state) {
    return state;
  }
  return {
    router: nextRouterState,
    history: state.history.concact(nextRouterState)
  };
};
```

todo

1.  epics
2.  reset
3.  better computed
4.  actions on store
5.  render callback state
6.  entity reducer
7.  refactor typings
8.  async inject

```js
import module from "some-module";

function someMethod() {
  module.call("ds");
}
```
