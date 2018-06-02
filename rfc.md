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
      <Consumer source={textState} selector={(data, props) => data[props.id]}>
        {data => {
          return <div>{data}</div>;
        }}
      </Consumer>
    );
  }
}

function List({ data }) {
  return <div>{data}</div>;
}

const ListEnhanced = connect(
  textState,
  (data, props) => (
    {
      a: data.entities[props.id]
    },
    true
  )
)(List);
```

```js
const s = rootState.map(state => {
  const policyState = policiesRootState.select(state);
  const selectedMachines = MachineState.ui.select(state).selectedMachines;
  return {
    selectedMachines,
    ui: policyState.ui,
    actions: policyState.actions,
    entities: policyState.entities
  };
});

const computedItems = s.map(({{ ids, entities }}) =>  ids.map(id => entities[id])});
const filteredItems = s.compose(computedItems, ([computedItems,{ start, pageSize }])=> computedItems.slice(start, pageSize))
const highlightedItems = s.compose(filteredItems,([filteredItems,{ highlightedSet }])=> filteredItems.map(el =>
  ({ ...el, active: highlightedSet.has(el) })));
```

```
compose(st, st2, st3, (st1,st2,st,3)=> {
  return {

  }
})
```

```js
export const entities = state({})
  .lens(
    actions.addPolicy,
    lensIndex(({ id }) => id)
      .key("items")
      .lensIndex(({ itemId }) => itemId),
    (state, { item }) => {
      return [...state, policyId];
    }
  )
  .on(events.replace, (_, payload) => payload);
```

```js
const t = createState(true);

const lens = lensIndex(({ id }) => id)
  .key("items")
  .index(({ itemId }) => itemId);
t.on(
  toggle,
  ({ id }) => ["policies", id],
  (state, action) => {
    return action;
  }
);
```

```js
const incCounter = createAction("incCounter");
const state = createState({
  counters: [0, 0, 0]
});

state.on(
  incCounter,
  (counterIndex, prop) => prop.key("counters").index(counterIndex),
  (state) =>  state + 1;
);

// take second counter and compute some data
const computed = state.map(el => ({ nested: { object: el.data[1] } } ), true);
// should be called once
computed.subscribe(el => {
  console.log("second counter updated");
});
store.dispatch(incCounter(1));
store.dispatch(incCounter(2));
store.dispatch(incCounter(3));


const store = state.use(local);
```

```js
const incCounter = createAction("incCounter");
const state = createState(0);
const state2 = createState(0);


state.on(
  incCounter,
  (state) =>  state + 1;
);

state2.on(
  incCounter,
  (state) =>  state + 1;
);

incCounter();
```

```
const event = createEvent();


effect.use((userId)=>{

})

const state = createState();

let state;
state.use(reactState({
  getState: ()=>state,
  setState: (newState, cb)=>{
    state = newState;
    cb();
  }
}))

class List  extends Component {
  componentWillMount() {

  }
  shouldComponentUpdate(){
    return false
  }

  render() {
    return{}
  }
}
```
