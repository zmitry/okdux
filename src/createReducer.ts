import { combineReducers } from 'redux'
import { getType, PACreator, FSACreator, Box, FSA } from 'typesafe-actions'

type Reducer<T> = {
  select<RootState>(rootState: RootState): T
  buildReducer: (path: string) => <P>(state: T, action: any) => T
  handle(
    event: string | [string],
    handler: (state: T, payload: any, meta: any) => T | void
  ): Reducer<T>
  on<E extends Box<any>, M extends Box<any>>(
    event: PACreator<string, E> | FSACreator<string, E, M>,
    handler: (state: T, payload: E) => T
  ): Reducer<T>
}

type Unpacked<T> = T extends Reducer<infer U> ? U : T

type R<T> = { [P in keyof T]: Unpacked<T[P]> }

const reducerPathSymbol = Symbol()

function getProp(object, keys) {
  keys = Array.isArray(keys) ? keys : keys.split('.')
  object = object[keys[0]]
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1))
  }
  return object
}

function isReducerBuilder(builder) {
  return typeof builder === 'object' && Reflect.has(builder, reducerPathSymbol)
}
function traverseReducers(reducers, path) {
  for (let key in reducers) {
    const reducer = reducers[key]
    if (isReducerBuilder(reducer)) {
      reducer[reducerPathSymbol] = (path ? path + '.' : '') + key
    }
  }
}

const identityWithDefault = d => (s = d) => s
function pruneInitialState(initialState) {
  return Object.keys(initialState).reduce(
    (acc, el) => {
      if (isReducerBuilder(initialState[el])) {
        acc.reducers[el] = initialState[el].buildReducer()
      } else {
        acc.defaultState[el] = initialState[el]
        acc.reducers[el] = identityWithDefault(initialState[el])
      }
      return acc
    },
    { reducers: {}, defaultState: {} }
  )
}
function createState<T>(initialState: T): Reducer<R<T>> {
  if (initialState === undefined) {
    throw new Error('initial state cannot be undefined')
  }
  const handlers = {}
  const defaultReducer = () => {}
  const builder = { buildReducer, on, handle, select, [reducerPathSymbol]: '' }

  function buildReducer(path) {
    if (path) {
      builder[reducerPathSymbol] = path
    }
    let nestedReducer = (d, _) => d
    let defaultState = initialState
    if (typeof initialState === 'object') {
      traverseReducers(initialState, builder[reducerPathSymbol] || path)
      const res = pruneInitialState(initialState)

      if (Object.keys(res.reducers).length !== 0) {
        nestedReducer = combineReducers(res.reducers)
      }
      defaultState = res.defaultState as T
    }

    return <P>(state = defaultState, action: FSA<string, P, any>) => {
      state = nestedReducer(state, action)

      if (!action) {
        return state
      }

      const { type, payload, meta } = action
      if (handlers[type]) {
        const handler = handlers[type]
        state = handler(state, payload, meta)
      }
      return state
    }
  }
  function on(action, handler) {
    if (action === undefined || action === null) {
      throw new Error('action should be and action got ' + action)
    }
    handlers[getType(action)] = handler
    return builder
  }
  function handle(type: string, handler) {
    if (Array.isArray(type)) {
      type.forEach(t => builder.handle(t, handler))
    } else {
      handlers[type] = handler
    }
    return builder
  }

  function select<R>(rs: R) {
    if (builder[reducerPathSymbol]) {
      return getProp(rs, builder[reducerPathSymbol])
    } else {
      return rs
    }
  }
  // @ts-ignore
  return builder
}

export { createState, Reducer, R, Unpacked, Box }
