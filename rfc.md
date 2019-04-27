async api

```tsx
const asyncApiMap = {
  async list(ctx, payload) {
    const rules = await api.list();
    return actions.addRules({
      list: rules
    });
  },
  async create(ctx, payload) {
    const res = await api.put(payload);
    return actions.addRule(res)
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
