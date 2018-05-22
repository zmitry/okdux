```jsx
const toggleEvent = createAction("toggle");
const toggle = createState(true);
toggle.on(toggleEvent, (state, payload) => !state);

const rootState = createState({ toggle });

const toggleViewState = toggle
  .map((state, dispatch) => ({
    toggle: state;
    toggleState: ()=>dispatch(toggleEvent()) ;
  }))
  .map(state => state.toggle);

rootState.use({
  subscribe: store.subscribe,
  getState: store.getState,
  context: dispatch
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

example without redux

```jsx
const toggle = createAction("toggle");
const toggleEvent = createState(true);
toggle.on(toggleEvent, (state, payload) => !state);

const rootState = createState({ toggle });

const toggleViewState = toggle
  .map((state, dispatch) => ({
    toggle: state;
    toggleState: dispatch(toggleEvent());
  }))
  .map(state => state.toggle);



class Provider extends React.Component {
  state = {}
  componentWillMount(){
    const reducer = rootState.buildReducer();
    rootState.use({
      subscribe: fn=> {
        this.cb = fn;
      },
      getState: ()=>this.state,
      context: (action)=>{
        return this.setState(state=>reducer(state, action), this.cb)
      }
    });
  }
  render(){
    return this.props.children
  }
}
```

computed

```jsx
const toggle = createState(true);
const counter = createState(0);
const text = createState("");
const ui = createState({ counter, text });

const rootState = createState({ toggle, ui });

ui
  .map(el => el.text)
  .compose(toggle, (text, toggle) => ({ text: text, toggle }))
  .map(state => {
    // track only toggle, and text
  });
```

```jsx
const toggle = createState(true);
const counter = createState(0);
const text = createState("");
const ui = createState({ counter, text });

const rootState = createState({ toggle, ui });

const textState = ui.map(el => el.text);

class List extends React.Component {
  render() {
    return (
      <Consumer source={textState}>
        {data => {
          return <div>{data}</div>;
        }}
      </Consumer>
    );
  }
}
```

```js
rootState
  .map(state => {
    const policyState = policiesRootState.select(state);
    const selectedMachines = MachineState.ui.select(state).selectedMachines;
    return {
      selectedMachines,
      ui: policyState.ui,
      actions: policyState.actions,
      entities: policyState.entities
    };
  })
  .compute(
    {
      selectedPolicies: policyGetters.getSelectedPolicies,
      policiesWithFilters: policyGetters.getAllPoliciesWithFilters,
      easyUiPolicies: policyGetters.getEasyUiPolicies,
      activePoliciesSet: MachineState.machineGetters.getActivePolicies
    },
    data => data
  );
```

```
compose(st, st2, st3, (st1,st2,st,3)=> {
  return {

  }
})
```
