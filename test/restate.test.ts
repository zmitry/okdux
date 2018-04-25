import { createState } from '../src/createReducer'
import { createAction } from '../src/createAction'

describe('restate', () => {
  let a
  let b
  let c
  let d
  let rootReducer
  let toggle
  let testState = { c: { a: 'aa', b: false, foo: 'qwrw' } }
  beforeEach(() => {
    toggle = createAction('toggle')
    a = createState('a')
    b = createState(true)
    c = createState({ a, b, foo: 'qwer' })
    d = createState({ c })
    rootReducer = d.buildReducer()
  })
  it('works basic', () => {
    let toggle = createAction('toggle')
    let a = createState('a')
    expect(() => createState()).toThrowError(Error)
    expect(a.buildReducer()()).toBe('a')
    let b = createState({})

    expect(b.buildReducer()()).toEqual({})
  })
  it('selectors work ok', () => {
    expect(a.select(testState)).toEqual('aa')
    expect(b.select(testState)).toEqual(false)
    expect(c.select(testState)).toEqual(testState.c)
    expect(d.select(testState)).toEqual(testState)
  })

  it('works ok with reducer', () => {
    expect(rootReducer({}, {})).toEqual({ c: { a: 'a', b: true, foo: 'qwer' } })
  })

  it('works ok with reducer and actions', () => {
    b.on(toggle, p => p)
    a.handle(['TEST'], p => p)

    const state = rootReducer({}, toggle(false))
    expect(b.select(state)).toEqual(false)
    const state2 = rootReducer(state, toggle(false))
    expect(b.select(state2)).toEqual(false)
    const state3 = rootReducer(state, { type: 'TEST', payload: 'a' })
    expect(a.select(state3)).toEqual('a')
  })
})
