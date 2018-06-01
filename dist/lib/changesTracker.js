"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
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
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
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
exports.checkKeyUsage = checkKeyUsage;
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
exports.getAllKeys = getAllKeys;
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
exports.walkThrowKeys = walkThrowKeys;
function wrapKeys(keys, data) {
    try {
        for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
            var keyPath = keys_1_1.value;
            var path = keyPath.split(".");
            // eslint-disable-next-line
            path.reduce(function (parent, prop) {
                var obj = lodash_1.get(data, parent, data) || data;
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
exports.wrapKeys = wrapKeys;
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
        if (this.trackedDependencies.length === 0 && !this.computed) {
            return true;
        }
        var res = lodash_1.intersection(this.trackedDependencies, changedKeys).length > 0 ||
            ChangesTracker.hasNestedChanges(this.trackedNestedDeps, changedKeys);
        return res;
    };
    return ChangesTracker;
}());
exports.ChangesTracker = ChangesTracker;
//# sourceMappingURL=changesTracker.js.map