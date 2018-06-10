export declare type KeyOf<T> = keyof T;
export interface DeepKeyOfArray<T> extends Array<string> {
    ["0"]?: KeyOf<T>;
    ["1"]?: this extends {
        ["0"]?: infer K0;
    } ? K0 extends KeyOf<T> ? KeyOf<T[K0]> : never : never;
    ["2"]?: this extends {
        ["0"]?: infer K0;
        ["1"]?: infer K1;
    } ? K0 extends KeyOf<T> ? (K1 extends KeyOf<T[K0]> ? KeyOf<T[K0][K1]> : never) : never : never;
    ["3"]?: this extends {
        ["0"]?: infer K0;
        ["1"]?: infer K1;
        ["2"]?: infer K2;
    } ? K0 extends KeyOf<T> ? K1 extends KeyOf<T[K0]> ? K2 extends KeyOf<T[K0][K1]> ? KeyOf<T[K0][K1][K2]> : never : never : never : never;
    ["4"]?: this extends {
        ["0"]?: infer K0;
        ["1"]?: infer K1;
        ["2"]?: infer K2;
        ["3"]?: infer K3;
    } ? K0 extends KeyOf<T> ? K1 extends KeyOf<T[K0]> ? K2 extends KeyOf<T[K0][K1]> ? K3 extends KeyOf<T[K0][K1][K2]> ? KeyOf<T[K0][K1][K2][K3]> : never : never : never : never : never;
    ["5"]?: this extends {
        ["0"]?: infer K0;
        ["1"]?: infer K1;
        ["2"]?: infer K2;
        ["3"]?: infer K3;
        ["4"]?: infer K4;
    } ? K0 extends KeyOf<T> ? K1 extends KeyOf<T[K0]> ? K2 extends KeyOf<T[K0][K1]> ? K3 extends KeyOf<T[K0][K1][K2]> ? K4 extends KeyOf<T[K0][K1][K2][K3]> ? KeyOf<T[K0][K1][K2][K3][K4]> : never : never : never : never : never : never;
    ["6"]?: this extends {
        ["0"]?: infer K0;
        ["1"]?: infer K1;
        ["2"]?: infer K2;
        ["3"]?: infer K3;
        ["4"]?: infer K4;
        ["5"]?: infer K5;
    } ? K0 extends KeyOf<T> ? K1 extends KeyOf<T[K0]> ? K2 extends KeyOf<T[K0][K1]> ? K3 extends KeyOf<T[K0][K1][K2]> ? K4 extends KeyOf<T[K0][K1][K2][K3]> ? K5 extends KeyOf<T[K0][K1][K2][K3][K4]> ? KeyOf<T[K0][K1][K2][K3][K4][K5]> : never : never : never : never : never : never : never;
}
export declare type ArrayHasIndex<MinLenght extends string> = {
    [K in MinLenght]: any;
};
export declare type DeepTypeOfArray<T, L extends DeepKeyOfArray<T>> = L extends ArrayHasIndex<"7"> ? any : L extends ArrayHasIndex<"6"> ? T[L["0"]][L["1"]][L["2"]][L["3"]][L["4"]][L["5"]][L["6"]] : L extends ArrayHasIndex<"5"> ? T[L["0"]][L["1"]][L["2"]][L["3"]][L["4"]][L["5"]] : L extends ArrayHasIndex<"4"> ? T[L["0"]][L["1"]][L["2"]][L["3"]][L["4"]] : L extends ArrayHasIndex<"3"> ? T[L["0"]][L["1"]][L["2"]][L["3"]] : L extends ArrayHasIndex<"2"> ? T[L["0"]][L["1"]][L["2"]] : L extends ArrayHasIndex<"1"> ? T[L["0"]][L["1"]] : L extends ArrayHasIndex<"0"> ? T[L["0"]] : T;
export declare type DeepKeyOf<T> = DeepKeyOfArray<T> | KeyOf<T>;
export declare type DeepTypeOf<T, L extends DeepKeyOf<T>> = L extends DeepKeyOfArray<T> ? DeepTypeOfArray<T, L> : L extends KeyOf<T> ? T[L] : never;
export declare type Defined<T> = T & {};
export declare type Prop<T, S extends keyof T> = Defined<T[S]>;
export declare function get<T, S1 extends keyof Defined<T>, S2 extends keyof Prop<Defined<T>, S1>, S3 extends keyof Prop<Prop<Defined<T>, S1>, S2>, S4 extends keyof Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>, S5 extends keyof Prop<Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>, S4>>(obj: T | undefined, prop1: S1, prop2: S2, prop3: S3, prop4: S4, prop5: S5): Prop<Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>, S4>[S5] | undefined;
export declare function get<T, S1 extends keyof Defined<T>, S2 extends keyof Prop<Defined<T>, S1>, S3 extends keyof Prop<Prop<Defined<T>, S1>, S2>, S4 extends keyof Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>>(obj: T | undefined, prop1: S1, prop2: S2, prop3: S3, prop4: S4): Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>[S4] | undefined;
export declare function get<T, S1 extends keyof Defined<T>, S2 extends keyof Prop<Defined<T>, S1>, S3 extends keyof Prop<Prop<Defined<T>, S1>, S2>>(obj: T | undefined, prop1: S1, prop2: S2, prop3: S3): Prop<Prop<Defined<T>, S1>, S2>[S3] | undefined;
export declare function get<T, S1 extends keyof Defined<T>, S2 extends keyof Prop<Defined<T>, S1>>(obj: T | undefined, prop1: S1, prop2: S2): Prop<Defined<T>, S1>[S2] | undefined;
export declare function get<T, S1 extends keyof Defined<T>>(obj: T | undefined, prop1: S1): Prop<Defined<T>, S1>;
