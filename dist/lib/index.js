(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('redux'), require('lodash'), require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'redux', 'lodash', 'react'], factory) :
  (factory((global.restate = {}),global.redux,global.lodash,global.React));
}(this, (function (exports,redux,lodash,React) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;

  var reducerPathSymbol = Symbol();
  var ctxSymbol = Symbol();
  var keys = [];
  function makeChangesMonitor() {
      var keys = [];
      var action;
      return {
          setChanged: function (newAction, key) {
              if (action !== newAction) {
                  keys = [key];
                  action = newAction;
              }
              else {
                  keys.push(key);
              }
          },
          // @ts-ignore
          getChangedKeys: function () { return keys; }
      };
  }
  var getKeys = function () { return keys; };
  function getProp(object, keys) {
      keys = Array.isArray(keys) ? keys : keys.split(".");
      object = object[keys[0]];
      if (object && keys.length > 1) {
          return getProp(object, keys.slice(1));
      }
      return object;
  }
  function isReducerBuilder(builder) {
      return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
  }
  function traverseReducers(reducers, _a) {
      var path = _a.path, ctx = _a.ctx;
      for (var key in reducers) {
          var reducer = reducers[key];
          if (isReducerBuilder(reducer)) {
              reducer[reducerPathSymbol] = (path ? path + "." : "") + key;
              ctx.addStore(reducer);
          }
      }
  }
  var atomReducer = function (defaultV, type) { return function (state, action) {
      if (state === void 0) { state = defaultV; }
      return action && action.type === type ? action.payload : state;
  }; };
  var identityWithDefault = function (d) { return function (s) {
      if (s === void 0) { s = d; }
      return s;
  }; };
  function pruneInitialState(initialState) {
      var acc = { reducers: {}, defaultState: {} };
      var hasReducers = false;
      for (var item in initialState) {
          var el = item;
          if (isReducerBuilder(initialState[el])) {
              acc.reducers[el] = initialState[el].buildReducer();
              hasReducers = true;
          }
          else if (initialState[el] && initialState[el].getType) {
              var t = initialState[el].getType();
              hasReducers = true;
              acc.reducers[el] = atomReducer(initialState[el].defaultValue, t);
          }
          else {
              acc.defaultState[el] = initialState[el];
          }
      }
      if (hasReducers) {
          for (var el in initialState) {
              if (!isReducerBuilder(initialState[el]) && !initialState[el].getType) {
                  acc.reducers[el] = identityWithDefault(initialState[el]);
              }
          }
      }
      else {
          return { reducers: {}, defaultState: initialState };
      }
      return acc;
  }
  var identity = function (d) {
      var _ = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          _[_i - 1] = arguments[_i];
      }
      return d;
  };
  function getDefaultReducer(initialState, _a) {
      var path = _a.path, ctx = _a.ctx;
      var defaultState = initialState;
      var nestedReducer = identity;
      if (typeof initialState === "object" && !Array.isArray(initialState)) {
          traverseReducers(initialState, { path: path, ctx: ctx });
          var res = pruneInitialState(initialState);
          if (Object.keys(res.reducers).length !== 0) {
              // @ts-ignore
              nestedReducer = redux.combineReducers(res.reducers);
          }
          defaultState = res.defaultState;
      }
      return { nestedReducer: nestedReducer, defaultState: defaultState };
  }
  var ReducerBuilder = /** @class */ (function () {
      function ReducerBuilder(initialState) {
          var _this = this;
          this.initialState = initialState;
          this.handlers = {};
          this[_a] = "";
          this[_b] = {};
          this.select = function (rs) {
              if (_this[reducerPathSymbol]) {
                  return getProp(rs, _this[reducerPathSymbol]);
              }
              else {
                  return rs;
              }
          };
          // @ts-ignore
          this.mapState = function (fn) {
              return function (state, props) { return fn(_this.select(state), props, state); };
          };
      }
      // @ts-ignore
      ReducerBuilder.prototype.on = function (action, handler) {
          if (action === undefined || action === null || !action.getType) {
              throw new Error("action should be an action, got " + action);
          }
          this.handlers[action.getType()] = handler;
          return this;
      };
      // @ts-ignore
      ReducerBuilder.prototype.handle = function (type, handler) {
          var _this = this;
          if (Array.isArray(type)) {
              type.forEach(function (t) { return _this.handle(t, handler); });
          }
          else {
              this.handlers[type] = handler;
          }
          return this;
      };
      Object.defineProperty(ReducerBuilder.prototype, "reducer", {
          get: function () {
              return this._reducer;
          },
          enumerable: true,
          configurable: true
      });
      ReducerBuilder.prototype.buildReducer = function (path) {
          var _this = this;
          if (path) {
              this[reducerPathSymbol] = path;
          }
          // @ts-ignore
          if (!this[ctxSymbol].changesMonitor) {
              // @ts-ignore
              this[ctxSymbol].changesMonitor = makeChangesMonitor();
          }
          var _a = getDefaultReducer(this.initialState, {
              path: this[reducerPathSymbol] || path,
              ctx: {
                  // @ts-ignore
                  addStore: this.addStore,
                  // @ts-ignore
                  changesMonitor: this[ctxSymbol].changesMonitor
              }
          }), defaultState = _a.defaultState, nestedReducer = _a.nestedReducer;
          var reducer = function (state, action) {
              if (state === void 0) { state = defaultState; }
              state = nestedReducer(state, action);
              if (!action) {
                  return state;
              }
              var type = action.type, payload = action.payload;
              if (_this.handlers[type]) {
                  var handler = _this.handlers[type];
                  var nextState = handler(state, payload, action);
                  if (nextState !== state) {
                      // @ts-ignore
                      _this[ctxSymbol].changesMonitor.setChanged(action, _this[reducerPathSymbol]);
                  }
                  state = nextState;
              }
              return state;
          };
          this._reducer = reducer;
          return reducer;
      };
      return ReducerBuilder;
  }());
  _a = reducerPathSymbol, _b = ctxSymbol;
  var _a, _b;
  //# sourceMappingURL=createReducer.js.map

  function shallowEquals(a, b) {
      if (Object.is(a, b)) {
          return true;
      }
      if (typeof a !== "object" || b === null || typeof a !== "object" || b === null) {
          return false;
      }
      if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
          return false;
      }
      var keysA = Object.keys(a);
      var keysB = Object.keys(b);
      if (keysA.length !== keysB.length) {
          return false;
      }
      for (var i = 0; i < keysA.length; i++) {
          if (!Object.prototype.hasOwnProperty.call(b, keysA[i]) ||
              !Object.is(a[keysA[i]], b[keysA[i]])) {
              return false;
          }
      }
      return true;
  }
  //# sourceMappingURL=shallowEquals.js.map

  function transformKey(key) {
      return key.split(".").reduce(function (acc, el) {
          return acc.concat([acc.length > 0 ? [lodash.last(acc), el].join(".") : el]);
      }, []);
  }
  var trackedFn;
  function checkKeyUsage(fn, data, context) {
      fn.deps = [];
      trackedFn = fn;
      var result = fn(data, context);
      walkThrowKeys(result);
      trackedFn = null;
      var deps = lodash.uniq(lodash.flatten(fn.deps.map(transformKey)));
      var res = [result, deps];
      fn.deps = null;
      return res;
  }
  function walkThrowKeys(data, key) {
      if (key === void 0) { key = null; }
      var keys = [];
      key && keys.push(key);
      if (Array.isArray(data)) {
          return keys;
      }
      if (typeof data === "object") {
          for (var i in data) {
              var res = walkThrowKeys(data[i], (key ? key + "." : "") + i);
              keys = keys.concat(res);
          }
      }
      return keys;
  }
  function wrapKeys(keys, data) {
      for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
          var keyPath = keys_1[_i];
          var path = keyPath.split(".");
          // eslint-disable-next-line
          path.reduce(function (parent, prop) {
              var obj = lodash.get(data, parent, data) || data;
              var valueProp = obj[prop];
              var pathToProp = parent.concat([prop]);
              if (typeof obj !== "object") {
                  return pathToProp;
              }
              Reflect.defineProperty(obj, prop, {
                  configurable: true,
                  enumerable: true,
                  get: function () {
                      trackedFn && trackedFn.deps.push(pathToProp.join("."));
                      return valueProp;
                  }
              });
              return pathToProp;
          }, []);
      }
  }
  var identity$1 = function (d) { return d; };
  var Store = /** @class */ (function () {
      function Store(fn, watchNested) {
          if (fn === void 0) { fn = identity$1; }
          this.reactors = [];
          this.observers = [];
          this.root = false;
          this.deps = [];
          this.initialized = false;
          this.selector = fn;
          this.watchNested = watchNested;
      }
      Store.prototype.getState = function () {
          return this.currentState;
      };
      Store.prototype.subscribe = function (fn) {
          // if (!this.initialized) {
          //   this.use(local);
          // }
          var _this = this;
          this.reactors.push(fn);
          return function () { return _this.reactors.filter(function (el) { return !fn; }); };
      };
      Store.prototype.forEach = function (fn) {
          this.observers.forEach(function (el) {
              fn(el);
              el.forEach(fn);
          });
      };
      Store.prototype.use = function (dataOrFn) {
          var _this = this;
          if (typeof dataOrFn === "function") {
              return dataOrFn(this);
          }
          var subscribe = dataOrFn.subscribe, getState = dataOrFn.getState, context = dataOrFn.context;
          this.root = true;
          this.initialized = true;
          this[ctxSymbol].context = context;
          this.forEach(function (el) {
              el[ctxSymbol] = _this[ctxSymbol];
              el.initialized = true;
          });
          var getKeys$$1 = this[ctxSymbol].changesMonitor.getChangedKeys;
          subscribe(function () {
              _this.set(getState(), getKeys$$1());
          });
          return dataOrFn;
      };
      Store.prototype.addStore = function (store) {
          this.observers.push(store);
          return store;
      };
      // @ts-ignore
      Store.prototype.map = function (fn, shouldWatchNested) {
          var store = new Store(fn, shouldWatchNested);
          return this.addStore(store);
      };
      Store.prototype.set = function (data, keys) {
          if (this.root) {
              keys = this.getState() ? keys : walkThrowKeys(data);
              wrapKeys(keys, data);
          }
          var context = this[ctxSymbol] && this[ctxSymbol].context;
          var state = this.getState();
          var computedData;
          // @ts-ignore
          if (this.watchNested) {
              var _a = checkKeyUsage(this.selector, data, context), cmpData = _a[0], deps = _a[1];
              computedData = cmpData;
              this.deps = lodash.uniq(this.deps.concat(deps));
              if (this.deps.length > 0 && lodash.intersection(this.deps, keys).length === 0) {
                  return;
              }
          }
          else {
              computedData = this.selector(data);
          }
          if (!shallowEquals(state, computedData)) {
              this.currentState = computedData;
              this.reactors.forEach(function (fn) { return fn(computedData); });
              this.observers.forEach(function (el) {
                  el.set(computedData, keys);
              });
          }
      };
      return Store;
  }());
  // function compose(...stores) {
  //   const store = new Store();
  //   function reactor() {
  //     store.callReactors(stores.map(el => el.getState()));
  //   }
  //   stores.forEach(el => {
  //     el.react(reactor);
  //   });
  //   return store;
  // }

  function createAction(type) {
      var action = function (payload) { return ({ type: type, payload: payload }); };
      var getType = function () { return type; };
      return Object.assign(action, { getType: getType });
  }
  function createAsyncAction(name) {
      return {
          request: createAction(name + "_REQUEST"),
          success: createAction(name + "_SUCCESS"),
          failure: createAction(name + "_FAILURE")
      };
  }
  var build = {
      plain: createAction,
      action: function () {
          // @ts-ignore
          return createAction(name);
      },
      mutator: function (defaultValue) { return function (name) {
          var action = function (data) {
              if (data === void 0) { data = defaultValue; }
              return ({ type: name, payload: data });
          };
          action.defaultValue = defaultValue;
          action.getType = function () { return name; };
          return action;
      }; },
      async: function () { return function (name) {
          return createAsyncAction(name);
      }; }
  };
  function createActions(actions, prefix) {
      if (prefix === void 0) { prefix = "@"; }
      //@ts-ignore
      return Object.keys(actions).reduce(function (acc, el) {
          acc[el] = actions[el](prefix + "/" + el);
          return acc;
      }, {});
  }
  function createEffects(actions, prefix) {
      if (prefix === void 0) { prefix = "@"; }
      // @ts-ignore
      return createActions(actions, prefix);
  }
  //# sourceMappingURL=createAction.js.map

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  var Consumer = /** @class */ (function (_super) {
      __extends(Consumer, _super);
      function Consumer(props) {
          var _this = _super.call(this, props) || this;
          //@ts-ignore
          _this.state = { currentState: props.source.getState() };
          return _this;
      }
      Consumer.prototype.componentDidMount = function () {
          var _this = this;
          // @ts-ignore
          this.unsub = this.props.source.subscribe(function (state) {
              // @ts-ignore
              if (state !== _this.state.currentState) {
                  // @ts-ignore
                  _this.setState({ currentState: state });
              }
          });
      };
      Consumer.prototype.componentWillUnmount = function () {
          this.unsub();
      };
      Consumer.prototype.render = function () {
          // @ts-ignore
          return this.props.children(this.state.currentState);
      };
      return Consumer;
  }(React.Component));
  //# sourceMappingURL=Consumer.js.map

  function local(state) {
      var reducer = state.buildReducer();
      var store = redux.createStore(reducer);
      store.context = store.dispatch;
      state.use(store);
      return store;
  }
  //# sourceMappingURL=ministore.js.map

  function createState(initialState) {
      if (initialState === undefined) {
          throw new Error("initial state cannot be undefined");
      }
      var reducer = new ReducerBuilder(initialState);
      // @ts-ignore
      var store = new Store(reducer.select);
      var res = Object.assign(reducer, store);
      // @ts-ignore
      var res2 = Object.assign(res, {
          use: store.use.bind(res),
          set: store.set.bind(res),
          addStore: store.addStore.bind(res),
          map: store.map.bind(res),
          getState: store.getState.bind(res),
          forEach: store.forEach.bind(res),
          subscribe: store.subscribe.bind(res)
      });
      // @ts-ignore
      return res2;
  }
  //# sourceMappingURL=index.js.map

  exports.createState = createState;
  exports.reducerPathSymbol = reducerPathSymbol;
  exports.ctxSymbol = ctxSymbol;
  exports.getKeys = getKeys;
  exports.ReducerBuilder = ReducerBuilder;
  exports.createAction = createAction;
  exports.build = build;
  exports.createActions = createActions;
  exports.createEffects = createEffects;
  exports.checkKeyUsage = checkKeyUsage;
  exports.wrapKeys = wrapKeys;
  exports.Store = Store;
  exports.Consumer = Consumer;
  exports.local = local;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
