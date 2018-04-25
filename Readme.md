create state
```

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
```
const reducer = combineReducers({
  ...reducerMapObj,
  machines: machinesRootState.buildReducer("machines"),
  actions: actionStateReducer
});
```
use state
```
import {  machines, ui  } from ‘./state’

const mapStateToProps = (state) => {
const machinesState = machines.select(state);
const machinesUiState = ui.select(state);
return {  first: machinesState[0], activeMachine: machineUiState.activeMachine  }  
} 
```