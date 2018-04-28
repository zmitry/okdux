# install
```
yarn add stateducer
```

create state
```js

export const entities = createState({})
  .on(events.replace, (_, payload) => payload)
  .on(events.create, reducer.set)
  .on(effectsEvents.getOne.success, reducer.set)
  .on(events.update, reducer.update);

export const ui = createState({}).on(
  events.setSelectedMachines,
  (state, payload) => {
    return { ...state, selectedMachines: payload };
  }
);

export const actionsState = handleActionsState(createState({}), effectsEvents);

export const machinesRootState = createState({
  entities,
  ui,
  actions: actionsState
});
```
connect state 
```js
const rootReducer = combineReducers({
  ...reducerMapObj,
  machines: machinesRootState.buildReducer("machines"),
  actions: actionStateReducer
});
// or
const rootState = createState({ machines, ...otherStuff }),
const rootReducer = rootState.buildReducer();
```
use state
```js
import {  machines, ui  } from ‘./state’

const mapStateToProps = (state) => {
const machinesState = machines.select(state);
const machinesUiState = ui.select(state);
return {  first: machinesState[0], activeMachine: machineUiState.activeMachine  }  
} 
```


# comparing to coredux
```js
// coredux
const fetchPostsRequest = createAction();
const fetchPostsSuccess = createAction();

const getArePostsFetching = createQuery();
const getPostsIds = createQuery();
const getPostsEntities = createQuery();
const getPosts = createQuery();

export const posts = createNode(defaultState)
  .setter(fetchPostsRequest, state => ({ ...state, areFetching: true }))
  .setter(fetchPostsSuccess, (state, posts) => ({
    areFetching: false,
    ids: posts.map(post => post.id),
    entities: new Map(posts.map(post => [post.id, post]))
  }))
  .getter(getArePostsFetching, select => state => state.areFetching)
  .getter(getPostsIds, select => state => state.ids)
  .getter(getPostsEntities, select => state => state.entities)
  .getter(getPosts, select =>
    createSelector(
      select(getPostsEntities),
      select(getPostsIds),
      (entities, ids) => ids.map(id => entities.get(id))
    )
  );

// restate

export const fetchPostsRequest = createAction();
export const fetchPostsSuccess = createAction();

const ids = createState([]);
const entities = createState({});
const areFetching = createState(false);
export const posts = createState({ ids, entities, areFetching });


ids.on(fetchPostsSuccess, (_, posts)=> posts.map(post => post.id))
entities.on(fetchPostsSuccess, (_, posts)=> new Map(posts.map(post => [post.id, post])))
rootState.on(fetchPostsRequest, state => ({ ...state, areFetching: true }));


const rootShape = {
    areFetching: areFetching.select,
    posts: createSelector(
        entities.select,
        ids.select,
        (entities, ids) => ids.map(id => entities.get(id))
      ),
    entities:  entities.select
}
```
