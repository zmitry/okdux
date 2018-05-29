import React from "react";
import { get, intersection } from "lodash";

let trackedFn;

function buildNestedKeys(trackedNested) {
  const res = trackedNested.reduce((acc, el) => {
    const path = el.split(".");
    path.pop();
    const key = path.join(".");
    acc.add(key);
    return acc;
  }, new Set());
  return res;
}

export function checkKeyUsage(fn) {
  fn.deps = [];
  trackedFn = fn;
  const result = fn();
  const exactTrack = fn.deps;
  fn.deps = [];
  walkThrowKeys(result);
  const trackedKeys = fn.deps;
  const trackNestedKeys = buildNestedKeys(trackedKeys);

  const res = [result, exactTrack, trackNestedKeys];
  trackedFn = null;
  fn.deps = null;
  return res;
}

export function getAllKeys(data, key = null) {
  let keys = [];
  key && keys.push(key);
  if (Array.isArray(data)) {
    return keys;
  }

  if (typeof data === "object") {
    for (let i in data) {
      const res = getAllKeys(data[i], (key ? key + "." : "") + i);
      keys = keys.concat(res);
    }
  }
  return keys;
}

const SKIP_WALK_AFTER = 20;

export function walkThrowKeys(data, key = null) {
  if (typeof data === "object") {
    let counter = 0;
    for (let i in data) {
      if (++counter > SKIP_WALK_AFTER) {
        break;
      }
      let prevLen = trackedFn.deps.length;
      const el = data[i];
      let nextLen = trackedFn.deps.length;
      if (prevLen !== nextLen) {
        continue;
      }
      walkThrowKeys(el);
    }
  }
}

export function wrapKeys(keys, data) {
  for (let keyPath of keys) {
    const path = keyPath.split(".");
    // eslint-disable-next-line
    path.reduce((parent, prop) => {
      const obj = get(data, parent, data) || data;

      const valueProp = obj[prop];
      const pathToProp = [...parent, prop];
      if (typeof obj !== "object") {
        return pathToProp;
      }
      Reflect.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        get() {
          trackedFn && trackedFn.deps.push(pathToProp.join("."));
          return valueProp;
        }
      });
      return pathToProp;
    }, []);
  }
}

export class ChangesTracker {
  private trackedDeps: Set<string>;
  private trackedNestedDeps: Set<string>;

  constructor() {
    this.trackedDeps = new Set<string>();
    this.trackedNestedDeps = new Set<string>();
  }

  static hasNestedChanges(nestedKeysToTrack, changedKeys) {
    let hasChanges = false;
    for (let item of nestedKeysToTrack) {
      const res = changedKeys.find(key => key.startsWith(item));
      if (res) {
        hasChanges = true;
        break;
      }
    }
    return hasChanges;
  }

  get trackedDependencies() {
    return [...this.trackedDeps];
  }
  get nestedTrackedDependencies() {
    return [...this.trackedNestedDeps];
  }
  public compute(fn) {
    const [cmpData, deps, nested] = checkKeyUsage(fn);

    deps.forEach(el => this.trackedDeps.add(el));
    nested.forEach(el => this.trackedNestedDeps.add(el));

    return cmpData;
  }

  public clearObservedKeys() {
    this.trackedDeps.clear();
    this.trackedNestedDeps.clear();
  }

  public hasChanges(changedKeys) {
    if (this.trackedDependencies.length === 0) {
      return true;
    }
    return (
      intersection(this.trackedDependencies, changedKeys).length > 0 ||
      ChangesTracker.hasNestedChanges(this.trackedNestedDeps, changedKeys)
    );
  }
}
