coredux vs restate

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
