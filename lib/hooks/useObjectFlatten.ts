import { useCallback, useRef } from "react";
import { set } from "lodash";
import { isObject } from "../type-guards.js";

export type JsonValues = string | number | boolean | null;

export interface NestedObject {
  [key: string]: NestedObject | JsonValues;
}
export interface FlattenObject {
  [key: string]: {
    __value: JsonValues;
    __type: "string" | "number" | "boolean" | "null";
    __editable: boolean;
  };
}

export const useObjectFlatten = <T extends NestedObject>(
  object: T,
  nullFallback: JsonValues
) => {
  const initialValue = useRef<FlattenObject | null>(null);
  const detectType = (value: unknown) => {
    if (value === null) return "null";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    throw Error("Unexpected Type");
  };
  const flat = useCallback(
    (object: T): FlattenObject => {
      const result: FlattenObject = {};
      const f = (key: string, value: unknown) => {
        if (isObject(value)) {
          Object.entries(value).forEach(([k, v]) => {
            if (k.includes(".")) {
              throw new Error("The property cannot contain a dot.");
            }
            f(`${key}${"."}${k}`, v);
          });
        } else {
          let editable = true;
          if (value === null && nullFallback === null) {
            editable = false;
          }
          Object.assign(result, {
            [key]: {
              __value: value,
              __type: detectType(value),
              __editable: editable,
            },
          });
        }
      };
      Object.entries(object).forEach(([key, value]) => f(key, value));
      return result;
    },
    [nullFallback]
  );
  const flattenObject: FlattenObject = flat(object);
  if (!initialValue.current) {
    initialValue.current = flattenObject;
  }
  const structured = useCallback((object: FlattenObject): T => {
    const result = {} as T;
    Object.entries(object).forEach(([key, value]) => {
      set(result, key, value.__value);
    });
    return result;
  }, []);
  return { initialValue, flattenObject, structured, detectType };
};
