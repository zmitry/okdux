async api classes

impl

```jsx
function createAsyncApi(state, actionsDecl, { onDone, onError, onStart } = { }) {
  const update = (state, payload) {
    return Object.assign({}, state, ...payload);
  }
  const getState = ()=>state.getState()
  const actions = {};
  for (let actionKey in actionsDecl) {
    const handler = actionsDecl[actionKey];
    const applyPatches = createAction(Symbol('patch by '+actionKey));

    state.on(applyPatches, update)
    const act = (...args)=>{
      let patches = [];
      const patchState = (patch)=>{
        patches.push(patch);
      }
      const api = { patchState, getState }

      let promise = Promise.resolve().then(el=>{onStart()}).then((handler(api, ...args))
      .then(()=>void 0)
      if(onError){
        promise = promise.catch(onError);
      }
      return promise.finally(()=>{
        applyPatches(patches)
        onDone && onDone(actionKey, args, patches);
        patches = [];
      })

    }
    actions[actionKey] = act;
  }
  return actions;
}
```

example with class

```tsx
class EffectsApi extends AsyncApi<typeof State> {
  async list(payload) {
    const rules = await api.list();
    return this.patchState({
      list: rules
    });
  }
  @NoHooks
  async create(payload) {
    const res = await api.put(payload);
    return actions.addRule.raw(res);
  }
  async update(payload) {
    const res = await api.patch(rule);
    const resActions = this.delete(payload);
    return [actions.updateItem(res), ...resActions];
  }
  async delete(payload) {
    const res = await api.del(rule);
    return [actions.deleteItem(res)];
  }
  onError(action, errror) {
    notification.error({ message: error.message });
  }
}
const effects = createAsyncApi(state, EffectsApi);
```

with objects

```tsx
const asyncApiMap = {
  async list(ctx, payload) {
    const rules = await api.list();
    return ctx.patchState({
      list: rules
    });
  },
  async create(ctx, payload) {
    const res = await api.put(payload);
    return [actions.addRule.raw(res)];
  },
  async update(ctx, payload) {
    const res = await api.patch(rule);
    actions.updateItem(res);
  },
  delete(ctx, payload) {
    const res = await api.del(rule);
    actions.deleteItem(res);
  }
};

const asyncApiHooks = {
  onError(actionType, error) {
    notification.error({ message: error.message });
  },
  onSuccess(actionType) {
    notification.open({ message: getNotificationText(actionType) });
  },
  onStart(event, args) {
    console.log("event, args: ", event, args);
    startLoading(event);
  },
  onDone(event) {
    stopLoading(event);
  }
};
const effects = createAsyncApi(state, asyncApiMap, asyncApiHooks);
```
