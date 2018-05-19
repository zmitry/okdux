```jsx
const toggle = createAction("toggle");
const toggle = createState(toggle);
toggle.on(toggle, (state, payload) => payload);

const rootState = createState({ toggle });

const toggleViewState = toggle.map((state, dispatch)=> {
  state: {
    toggle: state
  },
  actions: dispatch
}).map(state=> state.toggle)

rootState.use({
  subscribe: store.subscribe,
  getState: store.getState,
});

///

function Hello() {
  return (
    <Consumer source={toggleViewState}>
      {({ state, actions }) => {
        return <div />;
      }}
    </Consumer>
  );
}



class List extends React.Component {
  render() {
    return (
      <Provider store={rootState}>
        <Hello />
      </Provider>
    );
  }
}
```
