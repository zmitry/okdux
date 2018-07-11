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
