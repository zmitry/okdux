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

// const obj = {
//   v: { w: { x: { y: { z: { a: { b: { c: 2 } } } } } } }
// };
// const output: number = path(obj, ["v", "w", "x"]); // 💥
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
