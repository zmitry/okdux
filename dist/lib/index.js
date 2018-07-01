import { get } from 'lodash';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';

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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

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
var identity2 = function (_, d) { return d; };
var BaseReducerBuilder = /** @class */ (function () {
    function BaseReducerBuilder(initialState) {
        var _this = this;
        this.initialState = initialState;
        this.handlers = {};
        this.select = function (rs) {
            var path = _this.getPath();
            return path.length ? get(rs, _this.getPath()) : rs;
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
                    var data = get(state, path);
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
        var reducersMap = {};
        _this.stores = stores;
        Object.keys(storesToParse).forEach(function (el) {
            var reducer = storesToParse[el];
            if (reducer && reducer.getType) {
                reducer = reducer;
                reducer = new BaseReducerBuilder(reducer.defaultValue).on(reducer, identity2);
            }
            stores[el] = reducer;
            stores[el].setPath(el);
            stores[el].parent = parent;
            reducersMap[el] = stores[el].reducer;
        });
        var nestedReducer = combineReducers(reducersMap);
        var plainReducer = _this.reducer;
        _this.reducer = function (state, action) {
            return plainReducer(nestedReducer(state, action), action);
        };
        return _this;
    }
    return CombinedReducer;
}(BaseReducerBuilder));
function createState(data) {
    return new BaseReducerBuilder(data);
}
function combineState(data) {
    return new CombinedReducer(data);
}

var mutator = function (defaultValue) { return function (name) {
    var dispatch = null;
    var actionRaw = function (data) {
        if (data === void 0) { data = defaultValue; }
        return { type: name, payload: data };
    };
    var action = function (data) {
        if (data === void 0) { data = defaultValue; }
        var action = actionRaw(data);
        dispatch && dispatch(action);
        return action;
    };
    var actionMeta = {
        getType: function () { return name; },
        defaultValue: defaultValue,
        setDispatch: function (d) {
            dispatch = d;
        },
        raw: actionRaw
    };
    return Object.assign(action, actionMeta);
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

var lib = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.defaultMemoize = defaultMemoize;
exports.createSelectorCreator = createSelectorCreator;
exports.createStructuredSelector = createStructuredSelector;
function defaultEqualityCheck(a, b) {
  return a === b;
}

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  var length = prev.length;
  for (var i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

function defaultMemoize(func) {
  var equalityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultEqualityCheck;

  var lastArgs = null;
  var lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  return function () {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
    }

    lastArgs = arguments;
    return lastResult;
  };
}

function getDependencies(funcs) {
  var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  if (!dependencies.every(function (dep) {
    return typeof dep === 'function';
  })) {
    var dependencyTypes = dependencies.map(function (dep) {
      return typeof dep;
    }).join(', ');
    throw new Error('Selector creators expect all input-selectors to be functions, ' + ('instead received the following types: [' + dependencyTypes + ']'));
  }

  return dependencies;
}

function createSelectorCreator(memoize) {
  for (var _len = arguments.length, memoizeOptions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    memoizeOptions[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, funcs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      funcs[_key2] = arguments[_key2];
    }

    var recomputations = 0;
    var resultFunc = funcs.pop();
    var dependencies = getDependencies(funcs);

    var memoizedResultFunc = memoize.apply(undefined, [function () {
      recomputations++;
      // apply arguments instead of spreading for performance.
      return resultFunc.apply(null, arguments);
    }].concat(memoizeOptions));

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    var selector = defaultMemoize(function () {
      var params = [];
      var length = dependencies.length;

      for (var i = 0; i < length; i++) {
        // apply arguments instead of spreading and mutate a local list of params for performance.
        params.push(dependencies[i].apply(null, arguments));
      }

      // apply arguments instead of spreading for performance.
      return memoizedResultFunc.apply(null, params);
    });

    selector.resultFunc = resultFunc;
    selector.recomputations = function () {
      return recomputations;
    };
    selector.resetRecomputations = function () {
      return recomputations = 0;
    };
    return selector;
  };
}

var createSelector = exports.createSelector = createSelectorCreator(defaultMemoize);

function createStructuredSelector(selectors) {
  var selectorCreator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createSelector;

  if (typeof selectors !== 'object') {
    throw new Error('createStructuredSelector expects first argument to be an object ' + ('where each property is a selector, instead received a ' + typeof selectors));
  }
  var objectKeys = Object.keys(selectors);
  return selectorCreator(objectKeys.map(function (key) {
    return selectors[key];
  }), function () {
    for (var _len3 = arguments.length, values = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      values[_key3] = arguments[_key3];
    }

    return values.reduce(function (composition, value, index) {
      composition[objectKeys[index]] = value;
      return composition;
    }, {});
  });
}
});

unwrapExports(lib);
var lib_1 = lib.defaultMemoize;
var lib_2 = lib.createSelectorCreator;
var lib_3 = lib.createStructuredSelector;
var lib_4 = lib.createSelector;

function createComputed() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var fn = args.pop();
    // @ts-ignore
    var selector = lib_4(args.map(function (el) { return el.select; }), fn);
    var connector = function (fn) {
        var connectSelector = lib_4(selector, function (_, p) { return p; }, function (state, props) { return fn(state, props); });
        return connect(function (state, p) {
            //@ts-ignore
            return connectSelector(state, p);
        });
    };
    return {
        select: selector,
        connect: connector,
        use: function (fn) { return (connector = fn); }
    };
}

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
    reducer.use = function (dispatch) { return use(reducer, dispatch); };
    return reducer;
}
function forEachStore(stores, fn) {
    for (var item in stores) {
        if (stores[item]) {
            fn(stores[item]);
            if (stores[item].stores) {
                forEachStore(stores[item].stores, fn);
            }
        }
    }
}
function forEachAction(store, fn) {
    for (var item in store.handlers) {
        fn(store.handlers[item]);
    }
}
function use(store, dispatch) {
    var setDispatch = function (data) {
        data.action.setDispatch(dispatch);
    };
    forEachAction(store, setDispatch);
    forEachStore(store.stores, function (el) {
        forEachAction(el, setDispatch);
    });
}

export { createState$1 as createState, createAction, build, createActions, createEffects, createComputed };
