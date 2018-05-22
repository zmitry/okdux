export declare function checkKeyUsage(fn: any): any[];
export declare function getAllKeys(data: any, key?: any): any[];
export declare function walkThrowKeys(data: any, key?: any): void;
export declare function wrapKeys(keys: any, data: any): void;
export declare class ChangesTracker {
    private trackedDeps;
    private trackedNestedDeps;
    constructor();
    static hasNestedChanges(nestedKeysToTrack: any, changedKeys: any): boolean;
    readonly trackedDependencies: string[];
    readonly nestedTrackedDependencies: string[];
    compute(fn: any): any;
    clearObservedKeys(): void;
    hasChanges(changedKeys: any): boolean;
}
