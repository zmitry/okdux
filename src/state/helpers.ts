export const identity = <T>(d: T, ..._: any[]): T => d;
export const didentity = <T>(defaultV: T) => (d: T = defaultV, ..._: any[]): T => d;

export const identity2 = <T>(_, d: T): T => d;
