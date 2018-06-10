export type KeyOf<T> = keyof T;

export interface DeepKeyOfArray<T> extends Array<string> {
  ["0"]?: KeyOf<T>;

  ["1"]?: this extends {
    ["0"]?: infer K0;
  }
    ? K0 extends KeyOf<T> ? KeyOf<T[K0]> : never
    : never;
  ["2"]?: this extends {
    ["0"]?: infer K0;
    ["1"]?: infer K1;
  }
    ? K0 extends KeyOf<T> ? (K1 extends KeyOf<T[K0]> ? KeyOf<T[K0][K1]> : never) : never
    : never;
  ["3"]?: this extends {
    ["0"]?: infer K0;
    ["1"]?: infer K1;
    ["2"]?: infer K2;
  }
    ? K0 extends KeyOf<T>
      ? K1 extends KeyOf<T[K0]>
        ? K2 extends KeyOf<T[K0][K1]> ? KeyOf<T[K0][K1][K2]> : never
        : never
      : never
    : never;
  ["4"]?: this extends {
    ["0"]?: infer K0;
    ["1"]?: infer K1;
    ["2"]?: infer K2;
    ["3"]?: infer K3;
  }
    ? K0 extends KeyOf<T>
      ? K1 extends KeyOf<T[K0]>
        ? K2 extends KeyOf<T[K0][K1]>
          ? K3 extends KeyOf<T[K0][K1][K2]> ? KeyOf<T[K0][K1][K2][K3]> : never
          : never
        : never
      : never
    : never;
  ["5"]?: this extends {
    ["0"]?: infer K0;
    ["1"]?: infer K1;
    ["2"]?: infer K2;
    ["3"]?: infer K3;
    ["4"]?: infer K4;
  }
    ? K0 extends KeyOf<T>
      ? K1 extends KeyOf<T[K0]>
        ? K2 extends KeyOf<T[K0][K1]>
          ? K3 extends KeyOf<T[K0][K1][K2]>
            ? K4 extends KeyOf<T[K0][K1][K2][K3]> ? KeyOf<T[K0][K1][K2][K3][K4]> : never
            : never
          : never
        : never
      : never
    : never;
  ["6"]?: this extends {
    ["0"]?: infer K0;
    ["1"]?: infer K1;
    ["2"]?: infer K2;
    ["3"]?: infer K3;
    ["4"]?: infer K4;
    ["5"]?: infer K5;
  }
    ? K0 extends KeyOf<T>
      ? K1 extends KeyOf<T[K0]>
        ? K2 extends KeyOf<T[K0][K1]>
          ? K3 extends KeyOf<T[K0][K1][K2]>
            ? K4 extends KeyOf<T[K0][K1][K2][K3]>
              ? K5 extends KeyOf<T[K0][K1][K2][K3][K4]> ? KeyOf<T[K0][K1][K2][K3][K4][K5]> : never
              : never
            : never
          : never
        : never
      : never
    : never;
}

export type ArrayHasIndex<MinLenght extends string> = { [K in MinLenght]: any };

export type DeepTypeOfArray<T, L extends DeepKeyOfArray<T>> = L extends ArrayHasIndex<"7">
  ? any
  : L extends ArrayHasIndex<"6">
    ? T[L["0"]][L["1"]][L["2"]][L["3"]][L["4"]][L["5"]][L["6"]]
    : L extends ArrayHasIndex<"5">
      ? T[L["0"]][L["1"]][L["2"]][L["3"]][L["4"]][L["5"]]
      : L extends ArrayHasIndex<"4">
        ? T[L["0"]][L["1"]][L["2"]][L["3"]][L["4"]]
        : L extends ArrayHasIndex<"3">
          ? T[L["0"]][L["1"]][L["2"]][L["3"]]
          : L extends ArrayHasIndex<"2">
            ? T[L["0"]][L["1"]][L["2"]]
            : L extends ArrayHasIndex<"1">
              ? T[L["0"]][L["1"]]
              : L extends ArrayHasIndex<"0"> ? T[L["0"]] : T;

export type DeepKeyOf<T> = DeepKeyOfArray<T> | KeyOf<T>;

export type DeepTypeOf<T, L extends DeepKeyOf<T>> = L extends DeepKeyOfArray<T>
  ? DeepTypeOfArray<T, L>
  : L extends KeyOf<T> ? T[L] : never;

declare function path<T, L extends DeepKeyOf<T>>(object: T, params?: L): DeepTypeOf<T, L>;

declare function updateIn<State, Path extends DeepKeyOf<State>>(
  path: Path,
  handler: any
): (state: State) => DeepTypeOf<State, Path>;

const obj: { [key: number]: number } = [1, 2, 3, 5, 6];
const output = path(obj, [0]); // 💥
// const output2: object = path(obj, ["v", "w", "x"]); // ✔️
// const output4: { c: string } = path(obj, ["v", "w", "x", "y", "z", "a", "b"]); // 💥
// const output3: { c: number } = path(obj, ["v", "w", "x", "y", "z", "a", "b"]); // ✔️
// const output5: { wrong: "type" } = path(obj, ["v", "w", "x", "y", "z", "a", "b", "c"]); // ✔️ since after 7 levels there is no typechecking

// path(obj, "!"); // 💥
// path(obj, ["!"]); // 💥
// path(obj, ["v", "!"]); // 💥
// path(obj, ["v", "w", "!"]); // 💥
// path(obj, ["v", "w", "x", "!"]); // 💥
// path(obj, ["v", "w", "x", "y", "!"]); // 💥
// path(obj, ["v", "w", "x", "y", "z", "!"]); // 💥
// path(obj, ["v", "w", "x", "y", "z", "a", "!"]); // 💥
// path(obj, ["v", "w", "x", "y", "z", "a", "b", "!"]); // ✔️ since after 7 levels there is no typechecking
// path(obj, "v"); // ✔️
// path(obj, ["v"]); // ✔️
// path(obj, ["v", "w"]); // ✔️
// path(obj, ["v", "w", "x"]); // ✔️
// path(obj, ["v", "w", "x", "y"]); // ✔️
// path(obj, ["v", "w", "x", "y", "z"]); // ✔️
// path(obj, ["v", "w", "x", "y", "z", "a"]); // ✔️
// path(obj, ["v", "w", "x", "y", "z", "a", "b"]); // ✔️
// path(obj, ["v", "w", "x", "y", "z", "a", "b", "c"]); // ✔️

// The '& {}' hereeffectively eliminates undefined from the return type for us.
export type Defined<T> = T & {};
export type Prop<T, S extends keyof T> = Defined<T[S]>;

export function get<
  T,
  S1 extends keyof Defined<T>,
  S2 extends keyof Prop<Defined<T>, S1>,
  S3 extends keyof Prop<Prop<Defined<T>, S1>, S2>,
  S4 extends keyof Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>,
  S5 extends keyof Prop<Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>, S4>
>(
  obj: T | undefined,
  prop1: S1,
  prop2: S2,
  prop3: S3,
  prop4: S4,
  prop5: S5
): Prop<Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>, S4>[S5] | undefined;
export function get<
  T,
  S1 extends keyof Defined<T>,
  S2 extends keyof Prop<Defined<T>, S1>,
  S3 extends keyof Prop<Prop<Defined<T>, S1>, S2>,
  S4 extends keyof Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>
>(
  obj: T | undefined,
  prop1: S1,
  prop2: S2,
  prop3: S3,
  prop4: S4
): Prop<Prop<Prop<Defined<T>, S1>, S2>, S3>[S4] | undefined;
export function get<
  T,
  S1 extends keyof Defined<T>,
  S2 extends keyof Prop<Defined<T>, S1>,
  S3 extends keyof Prop<Prop<Defined<T>, S1>, S2>
>(
  obj: T | undefined,
  prop1: S1,
  prop2: S2,
  prop3: S3
): Prop<Prop<Defined<T>, S1>, S2>[S3] | undefined;
export function get<T, S1 extends keyof Defined<T>, S2 extends keyof Prop<Defined<T>, S1>>(
  obj: T | undefined,
  prop1: S1,
  prop2: S2
): Prop<Defined<T>, S1>[S2] | undefined;
export function get<T, S1 extends keyof Defined<T>>(
  obj: T | undefined,
  prop1: S1
): Prop<Defined<T>, S1>;
export function get<T>(obj: T, ...props: string[]): any | undefined {
  let value: any = obj;

  while (props.length > 0) {
    if (value == null) return undefined;

    let nextProp = props.shift() as keyof any;
    value = value[nextProp];
  }

  return value;
}

const r = get(obj, "v", "0");
