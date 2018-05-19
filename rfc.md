```jsx
const toggle = createAction("toggle");
const toggle = createState(toggle);
toggle.on(toggle, (state, payload) => payload);

const rootState = createState({ toggle });

const toggleViewState = toggle
  .map((state, dispatch) => ({
    toggle: state;
    actions: dispatch;
  }))
  .map(state => state.toggle);

rootState.use({
  subscribe: store.subscribe,
  getState: store.getState
});

///

function Hello() {
  return (
    <toggleViewState.Consumer>
      {({ state, actions }) => {
        return <div />;
      }}
    </toggleViewState.Consumer>
  );
}

class List extends React.Component {
  render() {
    return (
        <Hello />
    );
  }
}
```
