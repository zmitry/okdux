import { createActions, createState, build } from "../../../";

// utils
const getAllDescendantIds = (state, nodeId) =>
  state[nodeId].childIds.reduce(
    (acc, childId) => [...acc, childId, ...getAllDescendantIds(state, childId)],
    []
  );

const deleteMany = (state, ids) => {
  state = { ...state };
  ids.forEach(id => delete state[id]);
  return state;
};

///

const events = createActions({
  increment: build.plain,
  addChild: build.plain,
  removeChild: build.plain,
  createNode: build.plain,
  deleteNode: build.plain
});

const nodeLens = (nodeId, prop) => prop.index(nodeId);
const nodeChildLens = ({ id }, prop) => prop.index(id).key("childIds");

const state = createState({})
  .on(events.deleteNode, (state, nodeId) => {
    const descendantIds = getAllDescendantIds(state, nodeId);
    return deleteMany(state, [nodeId, ...descendantIds]);
  })
  .on(events.createNode, (state, nodeId) => ({
    ...state,
    [nodeId]: {
      id: nodeId,
      counter: 0,
      childIds: []
    }
  }))
  .on(events.increment, nodeLens, state => ({
    ...state,
    counter: state.counter + 1
  }))
  .on(events.addChild, nodeChildLens, (state, { childId }) => [...state, childId])
  .on(events.removeChild, nodeChildLens, (state, { childId }) =>
    state.filter(id => id !== childId)
  );

export { state, events };
