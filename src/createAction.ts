import { buildAction, PACreator, AsyncCreator } from 'typesafe-actions'

const createAction = <T>(name: string) => buildAction(name).payload<T>()

const build = {
  plain: name => {
    return buildAction(name).payload()
  },
  async: (payload = d => d, meta = d => d) => name => {
    return buildAction(name).async()
  }
}

function createActions<T>(
  actions: T,
  prefix: string = '@'
): { [M in keyof T]: PACreator<string, any> } {
  //@ts-ignore
  return Object.keys(actions).reduce((acc, el) => {
    acc[el] = actions[el](prefix + '/' + el)
    return acc
  }, {})
}

function createEffects<T>(
  actions: T,
  prefix: string = '@'
): { [M in keyof T]: AsyncCreator<string, any, any, any> } {
  // @ts-ignore
  return Object.keys(actions).reduce((acc, el) => {
    acc[el] = actions[el](prefix + '/' + el)
    return acc
  }, {})
}

export { createAction, buildAction, build, createActions, createEffects }
