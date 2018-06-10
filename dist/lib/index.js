(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash'), require('redux'), require('react')) :
    typeof define === 'function' && define.amd ? define(['exports', 'lodash', 'redux', 'react'], factory) :
    (factory((global.restate = {}),global.lodash,global.redux,global.React));
}(this, (function (exports,lodash,redux,React) { 'use strict';

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

    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var objectPathImmutable = createCommonjsModule(function (module) {
    /* globals define */

    (function (root, factory) {

      /* istanbul ignore next:cant test */
      {
        module.exports = factory();
      }
    })(commonjsGlobal, function () {
      var _hasOwnProperty = Object.prototype.hasOwnProperty;

      function isEmpty (value) {
        if (isNumber(value)) {
          return false
        }
        if (!value) {
          return true
        }
        if (isArray(value) && value.length === 0) {
          return true
        } else if (!isString(value)) {
          for (var i in value) {
            if (_hasOwnProperty.call(value, i)) {
              return false
            }
          }
          return true
        }
        return false
      }

      function isNumber (value) {
        return typeof value === 'number'
      }

      function isString (obj) {
        return typeof obj === 'string'
      }

      function isArray (obj) {
        return Array.isArray(obj)
      }

      function assignToObj (target, source) {
        for (var key in source) {
          if (_hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
        return target
      }

      function getKey (key) {
        var intKey = parseInt(key);
        if (intKey.toString() === key) {
          return intKey
        }
        return key
      }

      var objectPathImmutable = function (src) {
        var dest = src;
        var committed = false;

        var transaction = Object.keys(api).reduce(function (proxy, prop) {
          /* istanbul ignore else */
          if (typeof api[prop] === 'function') {
            proxy[prop] = function () {
              var args = [dest, src].concat(Array.prototype.slice.call(arguments));

              if (committed) {
                throw new Error('Cannot call ' + prop + ' after `value`')
              }

              dest = api[prop].apply(null, args);

              return transaction
            };
          }

          return proxy
        }, {});

        transaction.value = function () {
          committed = true;
          return dest
        };

        return transaction
      };

      function clone (obj, createIfEmpty, assumeArray) {
        if (obj == null) {
          if (createIfEmpty) {
            if (assumeArray) {
              return []
            }

            return {}
          }

          return obj
        } else if (isArray(obj)) {
          return obj.slice()
        }

        return assignToObj({}, obj)
      }

      function changeImmutable (dest, src, path, changeCallback) {
        if (isNumber(path)) {
          path = [path];
        }
        if (isEmpty(path)) {
          return src
        }
        if (isString(path)) {
          return changeImmutable(dest, src, path.split('.').map(getKey), changeCallback)
        }
        var currentPath = path[0];

        if (!dest || dest === src) {
          dest = clone(src, true, isNumber(currentPath));
        }

        if (path.length === 1) {
          return changeCallback(dest, currentPath)
        }

        if (src != null) {
          src = src[currentPath];
        }

        dest[currentPath] = changeImmutable(dest[currentPath], src, path.slice(1), changeCallback);

        return dest
      }

      var api = {};
      api.set = function set (dest, src, path, value) {
        if (isEmpty(path)) {
          return value
        }
        return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
          clonedObj[finalPath] = value;
          return clonedObj
        })
      };

      api.update = function update (dest, src, path, updater) {
        if (isEmpty(path)) {
          return updater(clone(src))
        }
        return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
          clonedObj[finalPath] = updater(clonedObj[finalPath]);
          return clonedObj
        })
      };

      api.push = function push (dest, src, path /*, values */) {
        var values = Array.prototype.slice.call(arguments, 3);
        if (isEmpty(path)) {
          if (!isArray(src)) {
            return values
          } else {
            return src.concat(values)
          }
        }
        return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
          if (!isArray(clonedObj[finalPath])) {
            clonedObj[finalPath] = values;
          } else {
            clonedObj[finalPath] = clonedObj[finalPath].concat(values);
          }
          return clonedObj
        })
      };

      api.insert = function insert (dest, src, path, value, at) {
        at = ~~at;
        if (isEmpty(path)) {
          if (!isArray(src)) {
            return [value]
          }

          var first = src.slice(0, at);
          first.push(value);
          return first.concat(src.slice(at))
        }
        return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
          var arr = clonedObj[finalPath];
          if (!isArray(arr)) {
            if (arr != null && typeof arr !== 'undefined') {
              throw new Error('Expected ' + path + 'to be an array. Instead got ' + typeof path)
            }
            arr = [];
          }

          var first = arr.slice(0, at);
          first.push(value);
          clonedObj[finalPath] = first.concat(arr.slice(at));
          return clonedObj
        })
      };

      api.del = function del (dest, src, path) {
        if (isEmpty(path)) {
          return void 0
        }
        return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
          if (Array.isArray(clonedObj)) {
            if (clonedObj[finalPath] !== undefined) {
              clonedObj.splice(finalPath, 1);
            }
          } else {
            if (clonedObj.hasOwnProperty(finalPath)) {
              delete clonedObj[finalPath];
            }
          }
          return clonedObj
        })
      };

      api.assign = function assign (dest, src, path, source) {
        if (isEmpty(path)) {
          if (isEmpty(source)) {
            return src
          }
          return assignToObj(clone(src), source)
        }
        return changeImmutable(dest, src, path, function (clonedObj, finalPath) {
          source = Object(source);
          var target = clone(clonedObj[finalPath], true);
          assignToObj(target, source);

          clonedObj[finalPath] = target;
          return clonedObj
        })
      };

      return Object.keys(api).reduce(function (objectPathImmutable, method) {
        objectPathImmutable[method] = api[method].bind(null, null);

        return objectPathImmutable
      }, objectPathImmutable)
    });
    });

    // function isReducerBuilder(builder) {
    //   return builder && typeof builder === "object" && Reflect.has(builder, reducerPathSymbol);
    // }
    var identity = function (d) {
        var _ = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _[_i - 1] = arguments[_i];
        }
        return d;
    };
    var BaseReducerBuilder = /** @class */ (function () {
        function BaseReducerBuilder(initialState) {
            var _this = this;
            this.initialState = initialState;
            this.handlers = {};
            this.select = function (rs) {
                var path = _this.getPath();
                return path.length ? lodash.get(rs, _this.getPath()) : rs;
            };
            // @ts-ignore
            this.mapState = function (fn) {
                if (fn === void 0) { fn = identity; }
                return function (state, props) { return fn(_this.select(state), props, state); };
            };
            this.reducer = function (state, action) {
                if (state === void 0) { state = _this.initialState; }
                if (!action) {
                    return state;
                }
                var type = action.type, payload = action.payload;
                var handlerObj = _this.handlers[type];
                if (handlerObj && handlerObj.handler) {
                    if (handlerObj.lens) {
                        var path = handlerObj.lens(payload);
                        var data = lodash.get(state, path);
                        if (typeof data !== "undefined") {
                            var subres = handlerObj.handler(data, payload);
                            state = objectPathImmutable.set(state, path, subres);
                        }
                    }
                    else {
                        var handler = _this.handlers[type].handler;
                        state = handler(state, payload, action);
                    }
                }
                return state;
            };
            if (typeof initialState === "undefined") {
                throw new Error("initial state should not be undefined");
            }
            this.reducer = this.reducer.bind(this);
        }
        BaseReducerBuilder.prototype.setPath = function (path) {
            this.path = path;
        };
        BaseReducerBuilder.prototype.getPath = function () {
            if (this.parent) {
                return this.parent.getPath().concat(this.path);
            }
            else {
                return this.path ? [this.path] : [];
            }
        };
        // @ts-ignore
        BaseReducerBuilder.prototype.on = function (action, handlerOrLens, handler) {
            if (handler === void 0) { handler = null; }
            if (handler) {
                this.lens(action, handlerOrLens, handler);
                return this;
            }
            else {
                handler = handlerOrLens;
            }
            if (action === undefined || action === null || !action.getType) {
                throw new Error("action should be an action, got " + action);
            }
            this.handlers[action.getType()] = {
                handler: handler,
                action: action
            };
            return this;
        };
        BaseReducerBuilder.prototype.lens = function (action, lens, handler) {
            this.handlers[action.getType()] = {
                handler: handler,
                lens: lens,
                action: action
            };
        };
        return BaseReducerBuilder;
    }());
    var CombinedReducer = /** @class */ (function (_super) {
        __extends(CombinedReducer, _super);
        function CombinedReducer(storesToParse) {
            var _this = _super.call(this, {}) || this;
            var parent = { getPath: _this.getPath.bind(_this) };
            var stores = {};
            // @ts-ignore
            _this.stores = stores;
            Object.keys(storesToParse).forEach(function (el) {
                var reducer = storesToParse[el];
                // @ts-ignore
                if (reducer && reducer.getType) {
                    // @ts-ignore
                    reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, function (_, p) { return p; });
                }
                stores[el] = reducer;
                // @ts-ignore
                reducer.setPath(el);
                // @ts-ignore
                reducer.parent = parent;
            });
            var reducersMap = Object.keys(stores).reduce(function (acc, el) {
                // @ts-ignore
                acc[el] = stores[el].reducer;
                return acc;
            }, {});
            // @ts-ignore
            var nestedReducer = redux.combineReducers(reducersMap);
            var plainReducer = _this.reducer;
            // @ts-ignore
            _this.reducer = function (state, action) {
                if (state === void 0) { state = _this.initialState; }
                // @ts-ignore
                return plainReducer(nestedReducer(state, action), action);
            };
            return _this;
        }
        return CombinedReducer;
    }(BaseReducerBuilder));
    function createState(data) {
        // @ts-ignore
        return new BaseReducerBuilder(data);
    }
    function combineState(data) {
        return new CombinedReducer(data);
    }
    //# sourceMappingURL=createReducer.js.map

    function shallowEquals(a, b) {
        if (a === void 0) { a = {}; }
        if (b === void 0) { b = {}; }
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

    var trackedFn;
    function buildNestedKeys(trackedNested) {
        var res = trackedNested.reduce(function (acc, el) {
            var path = el.split(".");
            path.pop();
            var key = path.join(".");
            acc.add(key);
            return acc;
        }, new Set());
        return res;
    }
    function checkKeyUsage(fn) {
        fn.deps = [];
        trackedFn = fn;
        var result = fn();
        var exactTrack = fn.deps;
        fn.deps = [];
        walkThrowKeys(result);
        var trackedKeys = fn.deps;
        var trackNestedKeys = buildNestedKeys(trackedKeys);
        var res = [result, exactTrack, trackNestedKeys];
        trackedFn = null;
        fn.deps = null;
        return res;
    }
    function getAllKeys(data, key) {
        if (key === void 0) { key = null; }
        var keys = [];
        key && keys.push(key);
        if (Array.isArray(data)) {
            return keys;
        }
        if (typeof data === "object") {
            for (var i in data) {
                var res = getAllKeys(data[i], (key ? key + "." : "") + i);
                keys = keys.concat(res);
            }
        }
        return keys;
    }
    var SKIP_WALK_AFTER = 20;
    function walkThrowKeys(data, key) {
        if (key === void 0) { key = null; }
        if (typeof data === "object") {
            var counter = 0;
            for (var i in data) {
                if (++counter > SKIP_WALK_AFTER) {
                    break;
                }
                var prevLen = trackedFn.deps.length;
                var el = data[i];
                var nextLen = trackedFn.deps.length;
                if (prevLen !== nextLen) {
                    continue;
                }
                walkThrowKeys(el);
            }
        }
    }
    function wrapKeys(keys, data) {
        try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var keyPath = keys_1_1.value;
                var path = keyPath.split(".");
                // eslint-disable-next-line
                path.reduce(function (parent, prop) {
                    var obj = lodash.get(data, parent, data) || data;
                    var valueProp = obj[prop];
                    var pathToProp = __spread(parent, [prop]);
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
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _a;
    }
    var ChangesTracker = /** @class */ (function () {
        function ChangesTracker() {
            this.computed = false;
            this.trackedDeps = new Set();
            this.trackedNestedDeps = new Set();
        }
        ChangesTracker.hasNestedChanges = function (nestedKeysToTrack, changedKeys) {
            var hasChanges = false;
            var _loop_1 = function (item) {
                var res = changedKeys.find(function (key) { return key.startsWith(item); });
                if (res) {
                    hasChanges = true;
                    return "break";
                }
            };
            try {
                for (var nestedKeysToTrack_1 = __values(nestedKeysToTrack), nestedKeysToTrack_1_1 = nestedKeysToTrack_1.next(); !nestedKeysToTrack_1_1.done; nestedKeysToTrack_1_1 = nestedKeysToTrack_1.next()) {
                    var item = nestedKeysToTrack_1_1.value;
                    var state_1 = _loop_1(item);
                    if (state_1 === "break")
                        break;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (nestedKeysToTrack_1_1 && !nestedKeysToTrack_1_1.done && (_a = nestedKeysToTrack_1.return)) _a.call(nestedKeysToTrack_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return hasChanges;
            var e_2, _a;
        };
        Object.defineProperty(ChangesTracker.prototype, "trackedDependencies", {
            get: function () {
                return __spread(this.trackedDeps);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChangesTracker.prototype, "nestedTrackedDependencies", {
            get: function () {
                return __spread(this.trackedNestedDeps);
            },
            enumerable: true,
            configurable: true
        });
        ChangesTracker.prototype.compute = function (fn) {
            var _this = this;
            var _a = __read(checkKeyUsage(fn), 3), cmpData = _a[0], deps = _a[1], nested = _a[2];
            deps.forEach(function (el) { return _this.trackedDeps.add(el); });
            nested.forEach(function (el) { return _this.trackedNestedDeps.add(el); });
            this.computed = true;
            return cmpData;
        };
        ChangesTracker.prototype.clearObservedKeys = function () {
            this.trackedDeps.clear();
            this.trackedNestedDeps.clear();
        };
        ChangesTracker.prototype.hasChanges = function (changedKeys) {
            var res = lodash.intersection(this.trackedDependencies, changedKeys).length > 0 ||
                ChangesTracker.hasNestedChanges(this.trackedNestedDeps, changedKeys);
            return res;
        };
        return ChangesTracker;
    }());
    //# sourceMappingURL=changesTracker.js.map

    var identity$1 = function (d) { return d; };
    var TYPES = {
        SINGLE_SHALLOW: 1,
        SINGLE_TRACK: 2,
        MULTI_TRACK: 3
    };
    function mergeKeys(data, store) {
        var _loop_1 = function (action) {
            var actionInfo = store.handlers[action];
            var existingPaths = data[action];
            data[action] = existingPaths
                ? __spread(existingPaths, [store.getPath().join(".")]) : [store.getPath().join(".")];
            if (actionInfo && actionInfo.lens) {
                data[action].push(function (action) {
                    return __spread(store.getPath(), actionInfo.lens(action)).join(".");
                });
            }
        };
        for (var action in store.handlers) {
            _loop_1(action);
        }
    }
    function forEachStore(stores, fn) {
        for (var item in stores) {
            if (stores[item]) {
                fn(stores[item]);
                if (stores[item].stores) {
                    fn(stores[item].stores);
                }
            }
        }
    }
    function forEachAction(store, fn) {
        for (var item in store.handlers) {
            fn(store.handlers[item]);
        }
    }
    var Store = /** @class */ (function () {
        function Store(data, type) {
            if (type === void 0) { type = TYPES.SINGLE_SHALLOW; }
            this.reactors = [];
            this.observers = [];
            this.keys = {};
            this.root = false;
            this.initialized = false;
            this.computed = false;
            this.type = TYPES.SINGLE_SHALLOW;
            this.type = type;
            // @ts-ignore
            this.compose = compose.bind(null, this);
            this.selector = data || identity$1;
            if (type === TYPES.SINGLE_TRACK) {
                this.changesTracker = new ChangesTracker();
            }
        }
        Store.prototype.getState = function () {
            return this.currentState;
        };
        Store.prototype.subscribe = function (fn) {
            var _this = this;
            this.reactors.push(fn);
            return function () { return _this.reactors.filter(function (el) { return !fn; }); };
        };
        Store.prototype.use = function (dataOrFn) {
            var _this = this;
            // @ts-ignore
            var origReducer = this.reducer;
            // @ts-ignore
            this.reducer = function (state, action) {
                var res = origReducer(state, action);
                // @ts-ignore
                _this.changedAction = action;
                return res;
            };
            if (typeof dataOrFn === "function") {
                return dataOrFn(this);
            }
            var subscribe = dataOrFn.subscribe, getState = dataOrFn.getState, dispatch = dataOrFn.dispatch;
            this.root = true;
            this.initialized = true;
            // this[ctxSymbol].context = context;
            //
            mergeKeys(this.keys, this);
            forEachAction(this, function (data) {
                data.action._dispatchers.add(dispatch);
            });
            // @ts-ignore
            forEachStore(this.stores, function (el) {
                // el[ctxSymbol] = this[ctxSymbol];
                mergeKeys(_this.keys, el);
                forEachAction(el, function (data) {
                    data.action._dispatchers.add(dispatch);
                });
                _this.addStore(el);
                el.initialized = true;
            });
            // const getKeys = this[ctxSymbol].changesMonitor.getChangedKeys;
            var getKeys = function (keys, action) {
                if (!action || !action.type || !keys[action.type]) {
                    return [];
                }
                return keys[action.type]
                    .map(function (el) {
                    if (typeof el === "function") {
                        return el(action.payload);
                    }
                    return el;
                })
                    .filter(function (el) { return !!el; });
            };
            subscribe(function () {
                // @ts-ignore
                _this.set(getState(), getKeys(_this.keys, _this.changedAction));
            });
            dispatch({ type: "init" });
            return dataOrFn;
        };
        Store.prototype.addStore = function (store) {
            this.observers.push(store);
        };
        // @ts-ignore
        Store.prototype.map = function (fn, shouldWatchNested) {
            var type = shouldWatchNested ? TYPES.SINGLE_TRACK : TYPES.SINGLE_SHALLOW;
            var store = new Store(fn, type);
            this.addStore(store);
            return store;
        };
        Store.prototype.handleChanged = function (computedData, keys) {
            this.computed = true;
            this.currentState = computedData;
            this.observers.forEach(function (el) { return el.run && el.run(computedData, keys); });
            this.reactors.forEach(function (fn) { return fn(computedData); });
        };
        Store.prototype.run = function (data, keys) {
            var _this = this;
            var computedData;
            switch (this.type) {
                case TYPES.SINGLE_TRACK:
                    computedData = this.changesTracker.compute(function () { return _this.selector(data); });
                    if (!this.changesTracker.hasChanges(keys) && this.computed) {
                        return;
                    }
                    break;
                default:
                    computedData = this.selector(data);
                    break;
            }
            if (shallowEquals(this.getState(), computedData)) {
                return;
            }
            this.handleChanged(computedData, keys);
        };
        Store.prototype.set = function (data, keys) {
            if (this.root) {
                keys = this.getState() ? keys : getAllKeys(data);
                wrapKeys(keys, data);
            }
            this.run(data, keys);
        };
        return Store;
    }());
    function compose() {
        var stores = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stores[_i] = arguments[_i];
        }
        var fn = stores.pop();
        var store = new Store(fn, TYPES.SINGLE_TRACK);
        function reactor() {
            // @ts-ignore
            if (stores.find(function (el) { return !el.computed; })) {
                return;
            }
            // @ts-ignore
            store.handleChanged(fn(stores.map(function (el) { return el.getState(); })), []);
        }
        stores.forEach(function (el) {
            // @ts-ignore
            el.subscribe(reactor);
        });
        return store;
    }

    var mutator = function (defaultValue) { return function (name) {
        var dispatchers = new Set();
        var actionRaw = function (data) {
            if (data === void 0) { data = defaultValue; }
            return { type: name, payload: data };
        };
        var action = function (data) {
            if (data === void 0) { data = defaultValue; }
            var action = actionRaw(data);
            dispatchers.forEach(function (fn) {
                fn(action);
            });
            return action;
        };
        return Object.assign(action, {
            getType: function () { return name; },
            defaultValue: defaultValue,
            _dispatchers: dispatchers,
            raw: actionRaw
        });
    }; };
    var createAction = mutator(null);
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
        mutator: mutator,
        async: function () { return function (name) {
            return createAsyncAction(name);
        }; }
    };
    function createActions(actions, prefix) {
        if (prefix === void 0) { prefix = "@"; }
        // @ts-ignore
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

    var Consumer = /** @class */ (function (_super) {
        __extends(Consumer, _super);
        function Consumer(props) {
            var _this = _super.call(this, props) || this;
            _this._hasUnmounted = false;
            if (props.selector) {
                _this.store = props.source.map(function (state) {
                    return props.selector(state, _this.props || props);
                }, props.track);
                _this.state = { currentState: props.selector(props.source.getState(), props) };
            }
            else {
                _this.store = props.source;
                _this.state = { currentState: _this.store.getState() };
            }
            return _this;
        }
        Consumer.prototype.componentDidMount = function () {
            this.subscribe();
        };
        Consumer.prototype.componentWillUnmount = function () {
            this.unsubscribe();
            this._hasUnmounted = true;
        };
        Consumer.prototype.render = function () {
            // @ts-ignore
            return this.props.children(this.state.currentState);
        };
        Consumer.prototype.subscribe = function () {
            var _this = this;
            var callback = function (state) {
                if (_this._hasUnmounted) {
                    return;
                }
                _this.setState({ currentState: state });
            };
            var unsubscribe = this.store.subscribe(callback);
            this._unsubscribe = unsubscribe;
        };
        Consumer.prototype.unsubscribe = function () {
            if (typeof this._unsubscribe === "function") {
                this._unsubscribe();
            }
            this._unsubscribe = null;
        };
        Consumer.displayName = "StoreConsumer";
        return Consumer;
    }(React.PureComponent));
    function connect(store, selector) {
        return function (Component) {
            return function (props) {
                return (React.createElement(Consumer, __assign({ source: store, selector: selector }, props), function (data) { return React.createElement(Component, __assign({}, props, data)); }));
            };
        };
    }
    //# sourceMappingURL=Consumer.js.map

    function local(state) {
        var store = redux.createStore(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return state.reducer.apply(state, __spread(args));
        });
        state.use(store);
        return store;
    }
    //# sourceMappingURL=ministore.js.map

    function createState$1(initialState) {
        if (initialState === undefined) {
            throw new Error("initial state cannot be undefined");
        }
        var reducer;
        if (typeof initialState === "object") {
            var firstKey = Object.keys(initialState)[0];
            if (initialState[firstKey] &&
                (initialState[firstKey].reducer || initialState[firstKey].getType)) {
                // @ts-ignore
                reducer = combineState(initialState);
            }
            else {
                reducer = createState(initialState);
            }
        }
        else {
            reducer = createState(initialState);
        }
        // @ts-ignore
        var store = new Store(reducer.select);
        var res = Object.assign(reducer, store);
        // @ts-ignore
        var res2 = Object.assign(res, {
            use: store.use.bind(res),
            set: store.set.bind(res),
            run: store.run.bind(res),
            handleChanged: store.handleChanged.bind(res),
            addStore: store.addStore.bind(res),
            map: store.map.bind(res),
            getState: store.getState.bind(res),
            subscribe: store.subscribe.bind(res)
        });
        // @ts-ignore
        return res2;
    }
    //# sourceMappingURL=index.js.map

    exports.createState = createState$1;
    exports.createAction = createAction;
    exports.build = build;
    exports.createActions = createActions;
    exports.createEffects = createEffects;
    exports.Store = Store;
    exports.compose = compose;
    exports.Consumer = Consumer;
    exports.connect = connect;
    exports.local = local;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
