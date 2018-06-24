(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash'), require('redux'), require('react')) :
    typeof define === 'function' && define.amd ? define(['exports', 'lodash', 'redux', 'react'], factory) :
    (factory((global.restate = {}),global.lodash,global.redux,global._react));
}(this, (function (exports,lodash,redux,_react) { 'use strict';

    var redux__default = 'default' in redux ? redux['default'] : redux;
    _react = _react && _react.hasOwnProperty('default') ? _react['default'] : _react;

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
            var nestedReducer = redux.combineReducers(reducersMap);
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

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     * 
     */

    function makeEmptyFunction(arg) {
      return function () {
        return arg;
      };
    }

    /**
     * This function accepts and discards inputs; it has no side effects. This is
     * primarily useful idiomatically for overridable function endpoints which
     * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
     */
    var emptyFunction = function emptyFunction() {};

    emptyFunction.thatReturns = makeEmptyFunction;
    emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
    emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
    emptyFunction.thatReturnsNull = makeEmptyFunction(null);
    emptyFunction.thatReturnsThis = function () {
      return this;
    };
    emptyFunction.thatReturnsArgument = function (arg) {
      return arg;
    };

    var emptyFunction_1 = emptyFunction;

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     *
     */

    /**
     * Use invariant() to assert state which your program assumes to be true.
     *
     * Provide sprintf-style format (only %s is supported) and arguments
     * to provide information about what broke and what you were
     * expecting.
     *
     * The invariant message will be stripped in production, but the invariant
     * will remain to ensure logic does not differ in production.
     */

    var validateFormat = function validateFormat(format) {};

    if (process.env.NODE_ENV !== 'production') {
      validateFormat = function validateFormat(format) {
        if (format === undefined) {
          throw new Error('invariant requires an error message argument');
        }
      };
    }

    function invariant(condition, format, a, b, c, d, e, f) {
      validateFormat(format);

      if (!condition) {
        var error;
        if (format === undefined) {
          error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error(format.replace(/%s/g, function () {
            return args[argIndex++];
          }));
          error.name = 'Invariant Violation';
        }

        error.framesToPop = 1; // we don't care about invariant's own frame
        throw error;
      }
    }

    var invariant_1 = invariant;

    /**
     * Similar to invariant but only logs a warning if the condition is not met.
     * This can be used to log issues in development environments in critical
     * paths. Removing the logging code for production environments will keep the
     * same logic and follow the same code paths.
     */

    var warning = emptyFunction_1;

    if (process.env.NODE_ENV !== 'production') {
      var printWarning = function printWarning(format) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var argIndex = 0;
        var message = 'Warning: ' + format.replace(/%s/g, function () {
          return args[argIndex++];
        });
        if (typeof console !== 'undefined') {
          console.error(message);
        }
        try {
          // --- Welcome to debugging React ---
          // This error was thrown as a convenience so that you can use this stack
          // to find the callsite that caused this warning to fire.
          throw new Error(message);
        } catch (x) {}
      };

      warning = function warning(condition, format) {
        if (format === undefined) {
          throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
        }

        if (format.indexOf('Failed Composite propType: ') === 0) {
          return; // Ignore CompositeComponent proptype check.
        }

        if (!condition) {
          for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
            args[_key2 - 2] = arguments[_key2];
          }

          printWarning.apply(undefined, [format].concat(args));
        }
      };
    }

    var warning_1 = warning;

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols) {
    			symbols = getOwnPropertySymbols(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

    var ReactPropTypesSecret_1 = ReactPropTypesSecret;

    if (process.env.NODE_ENV !== 'production') {
      var invariant$1 = invariant_1;
      var warning$1 = warning_1;
      var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
      var loggedTypeFailures = {};
    }

    /**
     * Assert that the values match with the type specs.
     * Error messages are memorized and will only be shown once.
     *
     * @param {object} typeSpecs Map of name to a ReactPropType
     * @param {object} values Runtime values that need to be type-checked
     * @param {string} location e.g. "prop", "context", "child context"
     * @param {string} componentName Name of the component for error messages.
     * @param {?Function} getStack Returns the component stack.
     * @private
     */
    function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
      if (process.env.NODE_ENV !== 'production') {
        for (var typeSpecName in typeSpecs) {
          if (typeSpecs.hasOwnProperty(typeSpecName)) {
            var error;
            // Prop type validation may throw. In case they do, we don't want to
            // fail the render phase where it didn't fail before. So we log it.
            // After these have been cleaned up, we'll let them throw.
            try {
              // This is intentionally an invariant that gets caught. It's the same
              // behavior as without this statement except with a better message.
              invariant$1(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
            } catch (ex) {
              error = ex;
            }
            warning$1(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
              // Only monitor this failure once because there tends to be a lot of the
              // same error.
              loggedTypeFailures[error.message] = true;

              var stack = getStack ? getStack() : '';

              warning$1(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
            }
          }
        }
      }
    }

    var checkPropTypes_1 = checkPropTypes;

    var factoryWithTypeCheckers = function(isValidElement, throwOnDirectAccess) {
      /* global Symbol */
      var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

      /**
       * Returns the iterator method function contained on the iterable object.
       *
       * Be sure to invoke the function with the iterable as context:
       *
       *     var iteratorFn = getIteratorFn(myIterable);
       *     if (iteratorFn) {
       *       var iterator = iteratorFn.call(myIterable);
       *       ...
       *     }
       *
       * @param {?object} maybeIterable
       * @return {?function}
       */
      function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === 'function') {
          return iteratorFn;
        }
      }

      /**
       * Collection of methods that allow declaration and validation of props that are
       * supplied to React components. Example usage:
       *
       *   var Props = require('ReactPropTypes');
       *   var MyArticle = React.createClass({
       *     propTypes: {
       *       // An optional string prop named "description".
       *       description: Props.string,
       *
       *       // A required enum prop named "category".
       *       category: Props.oneOf(['News','Photos']).isRequired,
       *
       *       // A prop named "dialog" that requires an instance of Dialog.
       *       dialog: Props.instanceOf(Dialog).isRequired
       *     },
       *     render: function() { ... }
       *   });
       *
       * A more formal specification of how these methods are used:
       *
       *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
       *   decl := ReactPropTypes.{type}(.isRequired)?
       *
       * Each and every declaration produces a function with the same signature. This
       * allows the creation of custom validation functions. For example:
       *
       *  var MyLink = React.createClass({
       *    propTypes: {
       *      // An optional string or URI prop named "href".
       *      href: function(props, propName, componentName) {
       *        var propValue = props[propName];
       *        if (propValue != null && typeof propValue !== 'string' &&
       *            !(propValue instanceof URI)) {
       *          return new Error(
       *            'Expected a string or an URI for ' + propName + ' in ' +
       *            componentName
       *          );
       *        }
       *      }
       *    },
       *    render: function() {...}
       *  });
       *
       * @internal
       */

      var ANONYMOUS = '<<anonymous>>';

      // Important!
      // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
      var ReactPropTypes = {
        array: createPrimitiveTypeChecker('array'),
        bool: createPrimitiveTypeChecker('boolean'),
        func: createPrimitiveTypeChecker('function'),
        number: createPrimitiveTypeChecker('number'),
        object: createPrimitiveTypeChecker('object'),
        string: createPrimitiveTypeChecker('string'),
        symbol: createPrimitiveTypeChecker('symbol'),

        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker,
      };

      /**
       * inlined Object.is polyfill to avoid requiring consumers ship their own
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
       */
      /*eslint-disable no-self-compare*/
      function is(x, y) {
        // SameValue algorithm
        if (x === y) {
          // Steps 1-5, 7-10
          // Steps 6.b-6.e: +0 != -0
          return x !== 0 || 1 / x === 1 / y;
        } else {
          // Step 6.a: NaN == NaN
          return x !== x && y !== y;
        }
      }
      /*eslint-enable no-self-compare*/

      /**
       * We use an Error-like object for backward compatibility as people may call
       * PropTypes directly and inspect their output. However, we don't use real
       * Errors anymore. We don't inspect their stack anyway, and creating them
       * is prohibitively expensive if they are created too often, such as what
       * happens in oneOfType() for any type before the one that matched.
       */
      function PropTypeError(message) {
        this.message = message;
        this.stack = '';
      }
      // Make `instanceof Error` still work for returned errors.
      PropTypeError.prototype = Error.prototype;

      function createChainableTypeChecker(validate) {
        if (process.env.NODE_ENV !== 'production') {
          var manualPropTypeCallCache = {};
          var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;

          if (secret !== ReactPropTypesSecret_1) {
            if (throwOnDirectAccess) {
              // New behavior only for users of `prop-types` package
              invariant_1(
                false,
                'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
                'Use `PropTypes.checkPropTypes()` to call them. ' +
                'Read more at http://fb.me/use-check-prop-types'
              );
            } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
              // Old behavior for people using React.PropTypes
              var cacheKey = componentName + ':' + propName;
              if (
                !manualPropTypeCallCache[cacheKey] &&
                // Avoid spamming the console because they are often not actionable except for lib authors
                manualPropTypeWarningCount < 3
              ) {
                warning_1(
                  false,
                  'You are manually calling a React.PropTypes validation ' +
                  'function for the `%s` prop on `%s`. This is deprecated ' +
                  'and will throw in the standalone `prop-types` package. ' +
                  'You may be seeing this warning due to a third-party PropTypes ' +
                  'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
                  propFullName,
                  componentName
                );
                manualPropTypeCallCache[cacheKey] = true;
                manualPropTypeWarningCount++;
              }
            }
          }
          if (props[propName] == null) {
            if (isRequired) {
              if (props[propName] === null) {
                return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
              }
              return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
            }
            return null;
          } else {
            return validate(props, propName, componentName, location, propFullName);
          }
        }

        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);

        return chainedCheckType;
      }

      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== expectedType) {
            // `propValue` being instance of, say, date/regexp, pass the 'object'
            // check, but we can offer a more precise error message here rather than
            // 'of type `object`'.
            var preciseType = getPreciseType(propValue);

            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunction_1.thatReturnsNull);
      }

      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== 'function') {
            return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
          }
          var propValue = props[propName];
          if (!Array.isArray(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
          }
          for (var i = 0; i < propValue.length; i++) {
            var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!isValidElement(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            var expectedClassName = expectedClass.name || ANONYMOUS;
            var actualClassName = getClassName(props[propName]);
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          process.env.NODE_ENV !== 'production' ? warning_1(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
          return emptyFunction_1.thatReturnsNull;
        }

        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          for (var i = 0; i < expectedValues.length; i++) {
            if (is(propValue, expectedValues[i])) {
              return null;
            }
          }

          var valuesString = JSON.stringify(expectedValues);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
        }
        return createChainableTypeChecker(validate);
      }

      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== 'function') {
            return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
          }
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== 'object') {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
          }
          for (var key in propValue) {
            if (propValue.hasOwnProperty(key)) {
              var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
              if (error instanceof Error) {
                return error;
              }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          process.env.NODE_ENV !== 'production' ? warning_1(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
          return emptyFunction_1.thatReturnsNull;
        }

        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (typeof checker !== 'function') {
            warning_1(
              false,
              'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
              'received %s at index %s.',
              getPostfixForTypeWarning(checker),
              i
            );
            return emptyFunction_1.thatReturnsNull;
          }
        }

        function validate(props, propName, componentName, location, propFullName) {
          for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
            var checker = arrayOfTypeCheckers[i];
            if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
              return null;
            }
          }

          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
        }
        return createChainableTypeChecker(validate);
      }

      function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          if (!isNode(props[propName])) {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== 'object') {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
          }
          for (var key in shapeTypes) {
            var checker = shapeTypes[key];
            if (!checker) {
              continue;
            }
            var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== 'object') {
            return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
          }
          // We need to check all keys in case some are required but missing from
          // props.
          var allKeys = objectAssign({}, props[propName], shapeTypes);
          for (var key in allKeys) {
            var checker = shapeTypes[key];
            if (!checker) {
              return new PropTypeError(
                'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
                '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
                '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
              );
            }
            var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
            if (error) {
              return error;
            }
          }
          return null;
        }

        return createChainableTypeChecker(validate);
      }

      function isNode(propValue) {
        switch (typeof propValue) {
          case 'number':
          case 'string':
          case 'undefined':
            return true;
          case 'boolean':
            return !propValue;
          case 'object':
            if (Array.isArray(propValue)) {
              return propValue.every(isNode);
            }
            if (propValue === null || isValidElement(propValue)) {
              return true;
            }

            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              var iterator = iteratorFn.call(propValue);
              var step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                  if (!isNode(step.value)) {
                    return false;
                  }
                }
              } else {
                // Iterator will provide entry [k,v] tuples rather than values.
                while (!(step = iterator.next()).done) {
                  var entry = step.value;
                  if (entry) {
                    if (!isNode(entry[1])) {
                      return false;
                    }
                  }
                }
              }
            } else {
              return false;
            }

            return true;
          default:
            return false;
        }
      }

      function isSymbol(propType, propValue) {
        // Native Symbol.
        if (propType === 'symbol') {
          return true;
        }

        // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
        if (propValue['@@toStringTag'] === 'Symbol') {
          return true;
        }

        // Fallback for non-spec compliant Symbols which are polyfilled.
        if (typeof Symbol === 'function' && propValue instanceof Symbol) {
          return true;
        }

        return false;
      }

      // Equivalent of `typeof` but with special handling for array and regexp.
      function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return 'array';
        }
        if (propValue instanceof RegExp) {
          // Old webkits (at least until Android 4.0) return 'function' rather than
          // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
          // passes PropTypes.object.
          return 'object';
        }
        if (isSymbol(propType, propValue)) {
          return 'symbol';
        }
        return propType;
      }

      // This handles more types than `getPropType`. Only used for error messages.
      // See `createPrimitiveTypeChecker`.
      function getPreciseType(propValue) {
        if (typeof propValue === 'undefined' || propValue === null) {
          return '' + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === 'object') {
          if (propValue instanceof Date) {
            return 'date';
          } else if (propValue instanceof RegExp) {
            return 'regexp';
          }
        }
        return propType;
      }

      // Returns a string that is postfixed to a warning about an invalid type.
      // For example, "undefined" or "of type array"
      function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch (type) {
          case 'array':
          case 'object':
            return 'an ' + type;
          case 'boolean':
          case 'date':
          case 'regexp':
            return 'a ' + type;
          default:
            return type;
        }
      }

      // Returns class name of the object, if any.
      function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }

      ReactPropTypes.checkPropTypes = checkPropTypes_1;
      ReactPropTypes.PropTypes = ReactPropTypes;

      return ReactPropTypes;
    };

    var factoryWithThrowingShims = function() {
      function shim(props, propName, componentName, location, propFullName, secret) {
        if (secret === ReactPropTypesSecret_1) {
          // It is still safe when called from React.
          return;
        }
        invariant_1(
          false,
          'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
          'Use PropTypes.checkPropTypes() to call them. ' +
          'Read more at http://fb.me/use-check-prop-types'
        );
      }  shim.isRequired = shim;
      function getShim() {
        return shim;
      }  // Important!
      // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
      var ReactPropTypes = {
        array: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,

        any: shim,
        arrayOf: getShim,
        element: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim
      };

      ReactPropTypes.checkPropTypes = emptyFunction_1;
      ReactPropTypes.PropTypes = ReactPropTypes;

      return ReactPropTypes;
    };

    var propTypes = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    if (process.env.NODE_ENV !== 'production') {
      var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
        Symbol.for &&
        Symbol.for('react.element')) ||
        0xeac7;

      var isValidElement = function(object) {
        return typeof object === 'object' &&
          object !== null &&
          object.$$typeof === REACT_ELEMENT_TYPE;
      };

      // By explicitly using `prop-types` you are opting into new development behavior.
      // http://fb.me/prop-types-in-prod
      var throwOnDirectAccess = true;
      module.exports = factoryWithTypeCheckers(isValidElement, throwOnDirectAccess);
    } else {
      // By explicitly using `prop-types` you are opting into new production behavior.
      // http://fb.me/prop-types-in-prod
      module.exports = factoryWithThrowingShims();
    }
    });

    var PropTypes = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.storeShape = exports.subscriptionShape = undefined;



    var _propTypes2 = _interopRequireDefault(propTypes);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var subscriptionShape = exports.subscriptionShape = _propTypes2.default.shape({
      trySubscribe: _propTypes2.default.func.isRequired,
      tryUnsubscribe: _propTypes2.default.func.isRequired,
      notifyNestedSubs: _propTypes2.default.func.isRequired,
      isSubscribed: _propTypes2.default.func.isRequired
    });

    var storeShape = exports.storeShape = _propTypes2.default.shape({
      subscribe: _propTypes2.default.func.isRequired,
      dispatch: _propTypes2.default.func.isRequired,
      getState: _propTypes2.default.func.isRequired
    });
    });

    unwrapExports(PropTypes);
    var PropTypes_1 = PropTypes.storeShape;
    var PropTypes_2 = PropTypes.subscriptionShape;

    var warning_1$1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.default = warning;
    /**
     * Prints a warning in the console if it exists.
     *
     * @param {String} message The warning message.
     * @returns {void}
     */
    function warning(message) {
      /* eslint-disable no-console */
      if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message);
      }
      /* eslint-enable no-console */
      try {
        // This error was thrown as a convenience so that if you enable
        // "break on all exceptions" in your console,
        // it would pause the execution at this line.
        throw new Error(message);
        /* eslint-disable no-empty */
      } catch (e) {}
      /* eslint-enable no-empty */
    }
    });

    unwrapExports(warning_1$1);

    var Provider = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.createProvider = createProvider;





    var _propTypes2 = _interopRequireDefault(propTypes);





    var _warning2 = _interopRequireDefault(warning_1$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var didWarnAboutReceivingStore = false;
    function warnAboutReceivingStore() {
      if (didWarnAboutReceivingStore) {
        return;
      }
      didWarnAboutReceivingStore = true;

      (0, _warning2.default)('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/reactjs/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
    }

    function createProvider() {
      var _Provider$childContex;

      var storeKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'store';
      var subKey = arguments[1];

      var subscriptionKey = subKey || storeKey + 'Subscription';

      var Provider = function (_Component) {
        _inherits(Provider, _Component);

        Provider.prototype.getChildContext = function getChildContext() {
          var _ref;

          return _ref = {}, _ref[storeKey] = this[storeKey], _ref[subscriptionKey] = null, _ref;
        };

        function Provider(props, context) {
          _classCallCheck(this, Provider);

          var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

          _this[storeKey] = props.store;
          return _this;
        }

        Provider.prototype.render = function render() {
          return _react.Children.only(this.props.children);
        };

        return Provider;
      }(_react.Component);

      if (process.env.NODE_ENV !== 'production') {
        Provider.prototype.componentWillReceiveProps = function (nextProps) {
          if (this[storeKey] !== nextProps.store) {
            warnAboutReceivingStore();
          }
        };
      }

      Provider.propTypes = {
        store: PropTypes.storeShape.isRequired,
        children: _propTypes2.default.element.isRequired
      };
      Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[storeKey] = PropTypes.storeShape.isRequired, _Provider$childContex[subscriptionKey] = PropTypes.subscriptionShape, _Provider$childContex);

      return Provider;
    }

    exports.default = createProvider();
    });

    unwrapExports(Provider);
    var Provider_1 = Provider.createProvider;

    var hoistNonReactStatics = createCommonjsModule(function (module, exports) {
    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */
    (function (global, factory) {
        module.exports = factory();
    }(commonjsGlobal, (function () {
        
        var REACT_STATICS = {
            childContextTypes: true,
            contextTypes: true,
            defaultProps: true,
            displayName: true,
            getDefaultProps: true,
            getDerivedStateFromProps: true,
            mixins: true,
            propTypes: true,
            type: true
        };
        
        var KNOWN_STATICS = {
            name: true,
            length: true,
            prototype: true,
            caller: true,
            callee: true,
            arguments: true,
            arity: true
        };
        
        var defineProperty = Object.defineProperty;
        var getOwnPropertyNames = Object.getOwnPropertyNames;
        var getOwnPropertySymbols = Object.getOwnPropertySymbols;
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        var getPrototypeOf = Object.getPrototypeOf;
        var objectPrototype = getPrototypeOf && getPrototypeOf(Object);
        
        return function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
            if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
                
                if (objectPrototype) {
                    var inheritedComponent = getPrototypeOf(sourceComponent);
                    if (inheritedComponent && inheritedComponent !== objectPrototype) {
                        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
                    }
                }
                
                var keys = getOwnPropertyNames(sourceComponent);
                
                if (getOwnPropertySymbols) {
                    keys = keys.concat(getOwnPropertySymbols(sourceComponent));
                }
                
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (!REACT_STATICS[key] && !KNOWN_STATICS[key] && (!blacklist || !blacklist[key])) {
                        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
                        try { // Avoid failures from read-only properties
                            defineProperty(targetComponent, key, descriptor);
                        } catch (e) {}
                    }
                }
                
                return targetComponent;
            }
            
            return targetComponent;
        };
    })));
    });

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    /**
     * Use invariant() to assert state which your program assumes to be true.
     *
     * Provide sprintf-style format (only %s is supported) and arguments
     * to provide information about what broke and what you were
     * expecting.
     *
     * The invariant message will be stripped in production, but the invariant
     * will remain to ensure logic does not differ in production.
     */

    var NODE_ENV = process.env.NODE_ENV;

    var invariant$2 = function(condition, format, a, b, c, d, e, f) {
      if (NODE_ENV !== 'production') {
        if (format === undefined) {
          throw new Error('invariant requires an error message argument');
        }
      }

      if (!condition) {
        var error;
        if (format === undefined) {
          error = new Error(
            'Minified exception occurred; use the non-minified dev environment ' +
            'for the full error message and additional helpful warnings.'
          );
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error(
            format.replace(/%s/g, function() { return args[argIndex++]; })
          );
          error.name = 'Invariant Violation';
        }

        error.framesToPop = 1; // we don't care about invariant's own frame
        throw error;
      }
    };

    var invariant_1$1 = invariant$2;

    var Subscription_1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    // encapsulates the subscription logic for connecting a component to the redux store, as
    // well as nesting subscriptions of descendant components, so that we can ensure the
    // ancestor components re-render before descendants

    var CLEARED = null;
    var nullListeners = {
      notify: function notify() {}
    };

    function createListenerCollection() {
      // the current/next pattern is copied from redux's createStore code.
      // TODO: refactor+expose that code to be reusable here?
      var current = [];
      var next = [];

      return {
        clear: function clear() {
          next = CLEARED;
          current = CLEARED;
        },
        notify: function notify() {
          var listeners = current = next;
          for (var i = 0; i < listeners.length; i++) {
            listeners[i]();
          }
        },
        get: function get() {
          return next;
        },
        subscribe: function subscribe(listener) {
          var isSubscribed = true;
          if (next === current) next = current.slice();
          next.push(listener);

          return function unsubscribe() {
            if (!isSubscribed || current === CLEARED) return;
            isSubscribed = false;

            if (next === current) next = current.slice();
            next.splice(next.indexOf(listener), 1);
          };
        }
      };
    }

    var Subscription = function () {
      function Subscription(store, parentSub, onStateChange) {
        _classCallCheck(this, Subscription);

        this.store = store;
        this.parentSub = parentSub;
        this.onStateChange = onStateChange;
        this.unsubscribe = null;
        this.listeners = nullListeners;
      }

      Subscription.prototype.addNestedSub = function addNestedSub(listener) {
        this.trySubscribe();
        return this.listeners.subscribe(listener);
      };

      Subscription.prototype.notifyNestedSubs = function notifyNestedSubs() {
        this.listeners.notify();
      };

      Subscription.prototype.isSubscribed = function isSubscribed() {
        return Boolean(this.unsubscribe);
      };

      Subscription.prototype.trySubscribe = function trySubscribe() {
        if (!this.unsubscribe) {
          this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.onStateChange) : this.store.subscribe(this.onStateChange);

          this.listeners = createListenerCollection();
        }
      };

      Subscription.prototype.tryUnsubscribe = function tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
          this.listeners.clear();
          this.listeners = nullListeners;
        }
      };

      return Subscription;
    }();

    exports.default = Subscription;
    });

    unwrapExports(Subscription_1);

    var connectAdvanced_1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    exports.default = connectAdvanced;



    var _hoistNonReactStatics2 = _interopRequireDefault(hoistNonReactStatics);



    var _invariant2 = _interopRequireDefault(invariant_1$1);





    var _Subscription2 = _interopRequireDefault(Subscription_1);



    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    var hotReloadingVersion = 0;
    var dummyState = {};
    function noop() {}
    function makeSelectorStateful(sourceSelector, store) {
      // wrap the selector in an object that tracks its results between runs.
      var selector = {
        run: function runComponentSelector(props) {
          try {
            var nextProps = sourceSelector(store.getState(), props);
            if (nextProps !== selector.props || selector.error) {
              selector.shouldComponentUpdate = true;
              selector.props = nextProps;
              selector.error = null;
            }
          } catch (error) {
            selector.shouldComponentUpdate = true;
            selector.error = error;
          }
        }
      };

      return selector;
    }

    function connectAdvanced(
    /*
      selectorFactory is a func that is responsible for returning the selector function used to
      compute new props from state, props, and dispatch. For example:
         export default connectAdvanced((dispatch, options) => (state, props) => ({
          thing: state.things[props.thingId],
          saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
        }))(YourComponent)
       Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
      outside of their selector as an optimization. Options passed to connectAdvanced are passed to
      the selectorFactory, along with displayName and WrappedComponent, as the second argument.
       Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
      props. Do not use connectAdvanced directly without memoizing results between calls to your
      selector, otherwise the Connect component will re-render on every state or props change.
    */
    selectorFactory) {
      var _contextTypes, _childContextTypes;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$getDisplayName = _ref.getDisplayName,
          getDisplayName = _ref$getDisplayName === undefined ? function (name) {
        return 'ConnectAdvanced(' + name + ')';
      } : _ref$getDisplayName,
          _ref$methodName = _ref.methodName,
          methodName = _ref$methodName === undefined ? 'connectAdvanced' : _ref$methodName,
          _ref$renderCountProp = _ref.renderCountProp,
          renderCountProp = _ref$renderCountProp === undefined ? undefined : _ref$renderCountProp,
          _ref$shouldHandleStat = _ref.shouldHandleStateChanges,
          shouldHandleStateChanges = _ref$shouldHandleStat === undefined ? true : _ref$shouldHandleStat,
          _ref$storeKey = _ref.storeKey,
          storeKey = _ref$storeKey === undefined ? 'store' : _ref$storeKey,
          _ref$withRef = _ref.withRef,
          withRef = _ref$withRef === undefined ? false : _ref$withRef,
          connectOptions = _objectWithoutProperties(_ref, ['getDisplayName', 'methodName', 'renderCountProp', 'shouldHandleStateChanges', 'storeKey', 'withRef']);

      var subscriptionKey = storeKey + 'Subscription';
      var version = hotReloadingVersion++;

      var contextTypes = (_contextTypes = {}, _contextTypes[storeKey] = PropTypes.storeShape, _contextTypes[subscriptionKey] = PropTypes.subscriptionShape, _contextTypes);
      var childContextTypes = (_childContextTypes = {}, _childContextTypes[subscriptionKey] = PropTypes.subscriptionShape, _childContextTypes);

      return function wrapWithConnect(WrappedComponent) {
        (0, _invariant2.default)(typeof WrappedComponent == 'function', 'You must pass a component to the function returned by ' + (methodName + '. Instead received ' + JSON.stringify(WrappedComponent)));

        var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

        var displayName = getDisplayName(wrappedComponentName);

        var selectorFactoryOptions = _extends({}, connectOptions, {
          getDisplayName: getDisplayName,
          methodName: methodName,
          renderCountProp: renderCountProp,
          shouldHandleStateChanges: shouldHandleStateChanges,
          storeKey: storeKey,
          withRef: withRef,
          displayName: displayName,
          wrappedComponentName: wrappedComponentName,
          WrappedComponent: WrappedComponent
        });

        var Connect = function (_Component) {
          _inherits(Connect, _Component);

          function Connect(props, context) {
            _classCallCheck(this, Connect);

            var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

            _this.version = version;
            _this.state = {};
            _this.renderCount = 0;
            _this.store = props[storeKey] || context[storeKey];
            _this.propsMode = Boolean(props[storeKey]);
            _this.setWrappedInstance = _this.setWrappedInstance.bind(_this);

            (0, _invariant2.default)(_this.store, 'Could not find "' + storeKey + '" in either the context or props of ' + ('"' + displayName + '". Either wrap the root component in a <Provider>, ') + ('or explicitly pass "' + storeKey + '" as a prop to "' + displayName + '".'));

            _this.initSelector();
            _this.initSubscription();
            return _this;
          }

          Connect.prototype.getChildContext = function getChildContext() {
            var _ref2;

            // If this component received store from props, its subscription should be transparent
            // to any descendants receiving store+subscription from context; it passes along
            // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
            // Connect to control ordering of notifications to flow top-down.
            var subscription = this.propsMode ? null : this.subscription;
            return _ref2 = {}, _ref2[subscriptionKey] = subscription || this.context[subscriptionKey], _ref2;
          };

          Connect.prototype.componentDidMount = function componentDidMount() {
            if (!shouldHandleStateChanges) return;

            // componentWillMount fires during server side rendering, but componentDidMount and
            // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
            // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
            // To handle the case where a child component may have triggered a state change by
            // dispatching an action in its componentWillMount, we have to re-run the select and maybe
            // re-render.
            this.subscription.trySubscribe();
            this.selector.run(this.props);
            if (this.selector.shouldComponentUpdate) this.forceUpdate();
          };

          Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            this.selector.run(nextProps);
          };

          Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
            return this.selector.shouldComponentUpdate;
          };

          Connect.prototype.componentWillUnmount = function componentWillUnmount() {
            if (this.subscription) this.subscription.tryUnsubscribe();
            this.subscription = null;
            this.notifyNestedSubs = noop;
            this.store = null;
            this.selector.run = noop;
            this.selector.shouldComponentUpdate = false;
          };

          Connect.prototype.getWrappedInstance = function getWrappedInstance() {
            (0, _invariant2.default)(withRef, 'To access the wrapped instance, you need to specify ' + ('{ withRef: true } in the options argument of the ' + methodName + '() call.'));
            return this.wrappedInstance;
          };

          Connect.prototype.setWrappedInstance = function setWrappedInstance(ref) {
            this.wrappedInstance = ref;
          };

          Connect.prototype.initSelector = function initSelector() {
            var sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions);
            this.selector = makeSelectorStateful(sourceSelector, this.store);
            this.selector.run(this.props);
          };

          Connect.prototype.initSubscription = function initSubscription() {
            if (!shouldHandleStateChanges) return;

            // parentSub's source should match where store came from: props vs. context. A component
            // connected to the store via props shouldn't use subscription from context, or vice versa.
            var parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey];
            this.subscription = new _Subscription2.default(this.store, parentSub, this.onStateChange.bind(this));

            // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
            // the middle of the notification loop, where `this.subscription` will then be null. An
            // extra null check every change can be avoided by copying the method onto `this` and then
            // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
            // listeners logic is changed to not call listeners that have been unsubscribed in the
            // middle of the notification loop.
            this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription);
          };

          Connect.prototype.onStateChange = function onStateChange() {
            this.selector.run(this.props);

            if (!this.selector.shouldComponentUpdate) {
              this.notifyNestedSubs();
            } else {
              this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate;
              this.setState(dummyState);
            }
          };

          Connect.prototype.notifyNestedSubsOnComponentDidUpdate = function notifyNestedSubsOnComponentDidUpdate() {
            // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
            // needs to notify nested subs. Once called, it unimplements itself until further state
            // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
            // a boolean check every time avoids an extra method call most of the time, resulting
            // in some perf boost.
            this.componentDidUpdate = undefined;
            this.notifyNestedSubs();
          };

          Connect.prototype.isSubscribed = function isSubscribed() {
            return Boolean(this.subscription) && this.subscription.isSubscribed();
          };

          Connect.prototype.addExtraProps = function addExtraProps(props) {
            if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props;
            // make a shallow copy so that fields added don't leak to the original selector.
            // this is especially important for 'ref' since that's a reference back to the component
            // instance. a singleton memoized selector would then be holding a reference to the
            // instance, preventing the instance from being garbage collected, and that would be bad
            var withExtras = _extends({}, props);
            if (withRef) withExtras.ref = this.setWrappedInstance;
            if (renderCountProp) withExtras[renderCountProp] = this.renderCount++;
            if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription;
            return withExtras;
          };

          Connect.prototype.render = function render() {
            var selector = this.selector;
            selector.shouldComponentUpdate = false;

            if (selector.error) {
              throw selector.error;
            } else {
              return (0, _react.createElement)(WrappedComponent, this.addExtraProps(selector.props));
            }
          };

          return Connect;
        }(_react.Component);

        Connect.WrappedComponent = WrappedComponent;
        Connect.displayName = displayName;
        Connect.childContextTypes = childContextTypes;
        Connect.contextTypes = contextTypes;
        Connect.propTypes = contextTypes;

        if (process.env.NODE_ENV !== 'production') {
          Connect.prototype.componentWillUpdate = function componentWillUpdate() {
            var _this2 = this;

            // We are hot reloading!
            if (this.version !== version) {
              this.version = version;
              this.initSelector();

              // If any connected descendants don't hot reload (and resubscribe in the process), their
              // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
              // listeners, this does mean that the old versions of connected descendants will still be
              // notified of state changes; however, their onStateChange function is a no-op so this
              // isn't a huge deal.
              var oldListeners = [];

              if (this.subscription) {
                oldListeners = this.subscription.listeners.get();
                this.subscription.tryUnsubscribe();
              }
              this.initSubscription();
              if (shouldHandleStateChanges) {
                this.subscription.trySubscribe();
                oldListeners.forEach(function (listener) {
                  return _this2.subscription.listeners.subscribe(listener);
                });
              }
            }
          };
        }

        return (0, _hoistNonReactStatics2.default)(Connect, WrappedComponent);
      };
    }
    });

    unwrapExports(connectAdvanced_1);

    var shallowEqual_1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.default = shallowEqual;
    var hasOwn = Object.prototype.hasOwnProperty;

    function is(x, y) {
      if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
      } else {
        return x !== x && y !== y;
      }
    }

    function shallowEqual(objA, objB) {
      if (is(objA, objB)) return true;

      if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
      }

      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) return false;

      for (var i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
          return false;
        }
      }

      return true;
    }
    });

    unwrapExports(shallowEqual_1);

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$1.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /** Built-in value references. */
    var getPrototype = _overArg(Object.getPrototypeOf, Object);

    var _getPrototype = getPrototype;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var objectTag = '[object Object]';

    /** Used for built-in method references. */
    var funcProto = Function.prototype,
        objectProto$2 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString.call(Object);

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = _getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty$2.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString.call(Ctor) == objectCtorString;
    }

    var isPlainObject_1 = isPlainObject;

    var verifyPlainObject_1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.default = verifyPlainObject;



    var _isPlainObject2 = _interopRequireDefault(isPlainObject_1);



    var _warning2 = _interopRequireDefault(warning_1$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function verifyPlainObject(value, displayName, methodName) {
      if (!(0, _isPlainObject2.default)(value)) {
        (0, _warning2.default)(methodName + '() in ' + displayName + ' must return a plain object. Instead received ' + value + '.');
      }
    }
    });

    unwrapExports(verifyPlainObject_1);

    var wrapMapToProps = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.wrapMapToPropsConstant = wrapMapToPropsConstant;
    exports.getDependsOnOwnProps = getDependsOnOwnProps;
    exports.wrapMapToPropsFunc = wrapMapToPropsFunc;



    var _verifyPlainObject2 = _interopRequireDefault(verifyPlainObject_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function wrapMapToPropsConstant(getConstant) {
      return function initConstantSelector(dispatch, options) {
        var constant = getConstant(dispatch, options);

        function constantSelector() {
          return constant;
        }
        constantSelector.dependsOnOwnProps = false;
        return constantSelector;
      };
    }

    // dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
    // to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
    // whether mapToProps needs to be invoked when props have changed.
    // 
    // A length of one signals that mapToProps does not depend on props from the parent component.
    // A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
    // therefore not reporting its length accurately..
    function getDependsOnOwnProps(mapToProps) {
      return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
    }

    // Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
    // this function wraps mapToProps in a proxy function which does several things:
    // 
    //  * Detects whether the mapToProps function being called depends on props, which
    //    is used by selectorFactory to decide if it should reinvoke on props changes.
    //    
    //  * On first call, handles mapToProps if returns another function, and treats that
    //    new function as the true mapToProps for subsequent calls.
    //    
    //  * On first call, verifies the first result is a plain object, in order to warn
    //    the developer that their mapToProps function is not returning a valid result.
    //    
    function wrapMapToPropsFunc(mapToProps, methodName) {
      return function initProxySelector(dispatch, _ref) {
        var displayName = _ref.displayName;

        var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
          return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
        };

        // allow detectFactoryAndVerify to get ownProps
        proxy.dependsOnOwnProps = true;

        proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
          proxy.mapToProps = mapToProps;
          proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
          var props = proxy(stateOrDispatch, ownProps);

          if (typeof props === 'function') {
            proxy.mapToProps = props;
            proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
            props = proxy(stateOrDispatch, ownProps);
          }

          if (process.env.NODE_ENV !== 'production') (0, _verifyPlainObject2.default)(props, displayName, methodName);

          return props;
        };

        return proxy;
      };
    }
    });

    unwrapExports(wrapMapToProps);
    var wrapMapToProps_1 = wrapMapToProps.wrapMapToPropsConstant;
    var wrapMapToProps_2 = wrapMapToProps.getDependsOnOwnProps;
    var wrapMapToProps_3 = wrapMapToProps.wrapMapToPropsFunc;

    var mapDispatchToProps = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.whenMapDispatchToPropsIsFunction = whenMapDispatchToPropsIsFunction;
    exports.whenMapDispatchToPropsIsMissing = whenMapDispatchToPropsIsMissing;
    exports.whenMapDispatchToPropsIsObject = whenMapDispatchToPropsIsObject;





    function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
      return typeof mapDispatchToProps === 'function' ? (0, wrapMapToProps.wrapMapToPropsFunc)(mapDispatchToProps, 'mapDispatchToProps') : undefined;
    }

    function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
      return !mapDispatchToProps ? (0, wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
        return { dispatch: dispatch };
      }) : undefined;
    }

    function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
      return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? (0, wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
        return (0, redux__default.bindActionCreators)(mapDispatchToProps, dispatch);
      }) : undefined;
    }

    exports.default = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];
    });

    unwrapExports(mapDispatchToProps);
    var mapDispatchToProps_1 = mapDispatchToProps.whenMapDispatchToPropsIsFunction;
    var mapDispatchToProps_2 = mapDispatchToProps.whenMapDispatchToPropsIsMissing;
    var mapDispatchToProps_3 = mapDispatchToProps.whenMapDispatchToPropsIsObject;

    var mapStateToProps = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.whenMapStateToPropsIsFunction = whenMapStateToPropsIsFunction;
    exports.whenMapStateToPropsIsMissing = whenMapStateToPropsIsMissing;



    function whenMapStateToPropsIsFunction(mapStateToProps) {
      return typeof mapStateToProps === 'function' ? (0, wrapMapToProps.wrapMapToPropsFunc)(mapStateToProps, 'mapStateToProps') : undefined;
    }

    function whenMapStateToPropsIsMissing(mapStateToProps) {
      return !mapStateToProps ? (0, wrapMapToProps.wrapMapToPropsConstant)(function () {
        return {};
      }) : undefined;
    }

    exports.default = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];
    });

    unwrapExports(mapStateToProps);
    var mapStateToProps_1 = mapStateToProps.whenMapStateToPropsIsFunction;
    var mapStateToProps_2 = mapStateToProps.whenMapStateToPropsIsMissing;

    var mergeProps = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    exports.defaultMergeProps = defaultMergeProps;
    exports.wrapMergePropsFunc = wrapMergePropsFunc;
    exports.whenMergePropsIsFunction = whenMergePropsIsFunction;
    exports.whenMergePropsIsOmitted = whenMergePropsIsOmitted;



    var _verifyPlainObject2 = _interopRequireDefault(verifyPlainObject_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function defaultMergeProps(stateProps, dispatchProps, ownProps) {
      return _extends({}, ownProps, stateProps, dispatchProps);
    }

    function wrapMergePropsFunc(mergeProps) {
      return function initMergePropsProxy(dispatch, _ref) {
        var displayName = _ref.displayName,
            pure = _ref.pure,
            areMergedPropsEqual = _ref.areMergedPropsEqual;

        var hasRunOnce = false;
        var mergedProps = void 0;

        return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
          var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

          if (hasRunOnce) {
            if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
          } else {
            hasRunOnce = true;
            mergedProps = nextMergedProps;

            if (process.env.NODE_ENV !== 'production') (0, _verifyPlainObject2.default)(mergedProps, displayName, 'mergeProps');
          }

          return mergedProps;
        };
      };
    }

    function whenMergePropsIsFunction(mergeProps) {
      return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
    }

    function whenMergePropsIsOmitted(mergeProps) {
      return !mergeProps ? function () {
        return defaultMergeProps;
      } : undefined;
    }

    exports.default = [whenMergePropsIsFunction, whenMergePropsIsOmitted];
    });

    unwrapExports(mergeProps);
    var mergeProps_1 = mergeProps.defaultMergeProps;
    var mergeProps_2 = mergeProps.wrapMergePropsFunc;
    var mergeProps_3 = mergeProps.whenMergePropsIsFunction;
    var mergeProps_4 = mergeProps.whenMergePropsIsOmitted;

    var verifySubselectors_1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.default = verifySubselectors;



    var _warning2 = _interopRequireDefault(warning_1$1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function verify(selector, methodName, displayName) {
      if (!selector) {
        throw new Error('Unexpected value for ' + methodName + ' in ' + displayName + '.');
      } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
        if (!selector.hasOwnProperty('dependsOnOwnProps')) {
          (0, _warning2.default)('The selector for ' + methodName + ' of ' + displayName + ' did not specify a value for dependsOnOwnProps.');
        }
      }
    }

    function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
      verify(mapStateToProps, 'mapStateToProps', displayName);
      verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
      verify(mergeProps, 'mergeProps', displayName);
    }
    });

    unwrapExports(verifySubselectors_1);

    var selectorFactory = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.impureFinalPropsSelectorFactory = impureFinalPropsSelectorFactory;
    exports.pureFinalPropsSelectorFactory = pureFinalPropsSelectorFactory;
    exports.default = finalPropsSelectorFactory;



    var _verifySubselectors2 = _interopRequireDefault(verifySubselectors_1);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
      return function impureFinalPropsSelector(state, ownProps) {
        return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
      };
    }

    function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
      var areStatesEqual = _ref.areStatesEqual,
          areOwnPropsEqual = _ref.areOwnPropsEqual,
          areStatePropsEqual = _ref.areStatePropsEqual;

      var hasRunAtLeastOnce = false;
      var state = void 0;
      var ownProps = void 0;
      var stateProps = void 0;
      var dispatchProps = void 0;
      var mergedProps = void 0;

      function handleFirstCall(firstState, firstOwnProps) {
        state = firstState;
        ownProps = firstOwnProps;
        stateProps = mapStateToProps(state, ownProps);
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        hasRunAtLeastOnce = true;
        return mergedProps;
      }

      function handleNewPropsAndNewState() {
        stateProps = mapStateToProps(state, ownProps);

        if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
      }

      function handleNewProps() {
        if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);

        if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
      }

      function handleNewState() {
        var nextStateProps = mapStateToProps(state, ownProps);
        var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
        stateProps = nextStateProps;

        if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        return mergedProps;
      }

      function handleSubsequentCalls(nextState, nextOwnProps) {
        var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
        var stateChanged = !areStatesEqual(nextState, state);
        state = nextState;
        ownProps = nextOwnProps;

        if (propsChanged && stateChanged) return handleNewPropsAndNewState();
        if (propsChanged) return handleNewProps();
        if (stateChanged) return handleNewState();
        return mergedProps;
      }

      return function pureFinalPropsSelector(nextState, nextOwnProps) {
        return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
      };
    }

    // TODO: Add more comments

    // If pure is true, the selector returned by selectorFactory will memoize its results,
    // allowing connectAdvanced's shouldComponentUpdate to return false if final
    // props have not changed. If false, the selector will always return a new
    // object and shouldComponentUpdate will always return true.

    function finalPropsSelectorFactory(dispatch, _ref2) {
      var initMapStateToProps = _ref2.initMapStateToProps,
          initMapDispatchToProps = _ref2.initMapDispatchToProps,
          initMergeProps = _ref2.initMergeProps,
          options = _objectWithoutProperties(_ref2, ['initMapStateToProps', 'initMapDispatchToProps', 'initMergeProps']);

      var mapStateToProps = initMapStateToProps(dispatch, options);
      var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
      var mergeProps = initMergeProps(dispatch, options);

      if (process.env.NODE_ENV !== 'production') {
        (0, _verifySubselectors2.default)(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
      }

      var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;

      return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
    }
    });

    unwrapExports(selectorFactory);
    var selectorFactory_1 = selectorFactory.impureFinalPropsSelectorFactory;
    var selectorFactory_2 = selectorFactory.pureFinalPropsSelectorFactory;

    var connect = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    exports.createConnect = createConnect;



    var _connectAdvanced2 = _interopRequireDefault(connectAdvanced_1);



    var _shallowEqual2 = _interopRequireDefault(shallowEqual_1);



    var _mapDispatchToProps2 = _interopRequireDefault(mapDispatchToProps);



    var _mapStateToProps2 = _interopRequireDefault(mapStateToProps);



    var _mergeProps2 = _interopRequireDefault(mergeProps);



    var _selectorFactory2 = _interopRequireDefault(selectorFactory);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    /*
      connect is a facade over connectAdvanced. It turns its args into a compatible
      selectorFactory, which has the signature:

        (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
      
      connect passes its args to connectAdvanced as options, which will in turn pass them to
      selectorFactory each time a Connect component instance is instantiated or hot reloaded.

      selectorFactory returns a final props selector from its mapStateToProps,
      mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
      mergePropsFactories, and pure args.

      The resulting final props selector is called by the Connect component instance whenever
      it receives new props or store state.
     */

    function match(arg, factories, name) {
      for (var i = factories.length - 1; i >= 0; i--) {
        var result = factories[i](arg);
        if (result) return result;
      }

      return function (dispatch, options) {
        throw new Error('Invalid value of type ' + typeof arg + ' for ' + name + ' argument when connecting component ' + options.wrappedComponentName + '.');
      };
    }

    function strictEqual(a, b) {
      return a === b;
    }

    // createConnect with default args builds the 'official' connect behavior. Calling it with
    // different options opens up some testing and extensibility scenarios
    function createConnect() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$connectHOC = _ref.connectHOC,
          connectHOC = _ref$connectHOC === undefined ? _connectAdvanced2.default : _ref$connectHOC,
          _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
          mapStateToPropsFactories = _ref$mapStateToPropsF === undefined ? _mapStateToProps2.default : _ref$mapStateToPropsF,
          _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
          mapDispatchToPropsFactories = _ref$mapDispatchToPro === undefined ? _mapDispatchToProps2.default : _ref$mapDispatchToPro,
          _ref$mergePropsFactor = _ref.mergePropsFactories,
          mergePropsFactories = _ref$mergePropsFactor === undefined ? _mergeProps2.default : _ref$mergePropsFactor,
          _ref$selectorFactory = _ref.selectorFactory,
          selectorFactory$$1 = _ref$selectorFactory === undefined ? _selectorFactory2.default : _ref$selectorFactory;

      return function connect(mapStateToProps$$1, mapDispatchToProps$$1, mergeProps$$1) {
        var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
            _ref2$pure = _ref2.pure,
            pure = _ref2$pure === undefined ? true : _ref2$pure,
            _ref2$areStatesEqual = _ref2.areStatesEqual,
            areStatesEqual = _ref2$areStatesEqual === undefined ? strictEqual : _ref2$areStatesEqual,
            _ref2$areOwnPropsEqua = _ref2.areOwnPropsEqual,
            areOwnPropsEqual = _ref2$areOwnPropsEqua === undefined ? _shallowEqual2.default : _ref2$areOwnPropsEqua,
            _ref2$areStatePropsEq = _ref2.areStatePropsEqual,
            areStatePropsEqual = _ref2$areStatePropsEq === undefined ? _shallowEqual2.default : _ref2$areStatePropsEq,
            _ref2$areMergedPropsE = _ref2.areMergedPropsEqual,
            areMergedPropsEqual = _ref2$areMergedPropsE === undefined ? _shallowEqual2.default : _ref2$areMergedPropsE,
            extraOptions = _objectWithoutProperties(_ref2, ['pure', 'areStatesEqual', 'areOwnPropsEqual', 'areStatePropsEqual', 'areMergedPropsEqual']);

        var initMapStateToProps = match(mapStateToProps$$1, mapStateToPropsFactories, 'mapStateToProps');
        var initMapDispatchToProps = match(mapDispatchToProps$$1, mapDispatchToPropsFactories, 'mapDispatchToProps');
        var initMergeProps = match(mergeProps$$1, mergePropsFactories, 'mergeProps');

        return connectHOC(selectorFactory$$1, _extends({
          // used in error messages
          methodName: 'connect',

          // used to compute Connect's displayName from the wrapped component's displayName.
          getDisplayName: function getDisplayName(name) {
            return 'Connect(' + name + ')';
          },

          // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
          shouldHandleStateChanges: Boolean(mapStateToProps$$1),

          // passed through to selectorFactory
          initMapStateToProps: initMapStateToProps,
          initMapDispatchToProps: initMapDispatchToProps,
          initMergeProps: initMergeProps,
          pure: pure,
          areStatesEqual: areStatesEqual,
          areOwnPropsEqual: areOwnPropsEqual,
          areStatePropsEqual: areStatePropsEqual,
          areMergedPropsEqual: areMergedPropsEqual

        }, extraOptions));
      };
    }

    exports.default = createConnect();
    });

    unwrapExports(connect);
    var connect_1 = connect.createConnect;

    var lib$1 = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;
    exports.connect = exports.connectAdvanced = exports.createProvider = exports.Provider = undefined;



    var _Provider2 = _interopRequireDefault(Provider);



    var _connectAdvanced2 = _interopRequireDefault(connectAdvanced_1);



    var _connect2 = _interopRequireDefault(connect);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    exports.Provider = _Provider2.default;
    exports.createProvider = Provider.createProvider;
    exports.connectAdvanced = _connectAdvanced2.default;
    exports.connect = _connect2.default;
    });

    unwrapExports(lib$1);
    var lib_1$1 = lib$1.connect;
    var lib_2$1 = lib$1.connectAdvanced;
    var lib_3$1 = lib$1.createProvider;
    var lib_4$1 = lib$1.Provider;

    function createComputed() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var fn = args.pop();
        // @ts-ignore
        var selector = lib_4(args.map(function (el) { return el.select; }), fn);
        var connector = function (fn) { return lib_1$1(function (state) { return fn(selector(state)); }); };
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
        return Object.assign(reducer, {
            use: use.bind(null, reducer)
        });
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
    function use(store, dispatch) {
        forEachAction(store, function (data) {
            data.action._dispatchers.add(dispatch);
        });
        forEachStore(store.stores, function (el) {
            forEachAction(el, function (data) {
                data.action._dispatchers.add(dispatch);
            });
        });
    }

    exports.createState = createState$1;
    exports.createAction = createAction;
    exports.build = build;
    exports.createActions = createActions;
    exports.createEffects = createEffects;
    exports.createComputed = createComputed;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
