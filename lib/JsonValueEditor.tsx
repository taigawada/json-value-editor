import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Tooltip } from "react-tooltip";
import { useKey } from "react-use";
import * as Tooltip from "@radix-ui/react-tooltip";

import styles from "./json-value-editor.module.scss";

import { useOutsideClick, useObjectFlatten } from "./hooks/index.js";
import { isObject } from "./type-guards.js";
import type { JsonValues } from "./hooks/index.js";
import { NestedObject } from "./hooks/useObjectFlatten.ts";
export type { JsonValues } from "./hooks/index.js";

export interface TypeError {
  key: string;
  expectedType: "string" | "number" | "boolean" | "null";
  currentType: "string" | "number" | "boolean" | "null";
}

export interface JsonValueEditorProps<T> {
  object: T;
  onChange: (newObject: T) => void;
  errorMessage?: (
    expectedType: TypeError["expectedType"] | undefined,
    currentType: TypeError["currentType"] | undefined
  ) => string;
  indentWidth?: number;
  changeType?: boolean;
  convertTextToNumber?: boolean;
  nullFallback?: JsonValues;
}

export function JsonValueEditor<T extends NestedObject>({
  object,
  onChange,
  errorMessage,
  indentWidth = 4,
  changeType = false,
  convertTextToNumber = false,
  nullFallback = null,
}: JsonValueEditorProps<T>) {
  const indentMarkup = (depth: number) =>
    [...new Array(indentWidth * depth).keys()].map(() => " ").join("");
  const lines = (JSON.stringify(object, null, 1).match(/\n/g) || []).length + 1;
  const dataGutter = [...new Array(lines).keys()]
    .map((index) => index + 1)
    .join("\n ");
  const [typeErrors, setTypeErrors] = useState<TypeError | null>(null);
  const { flattenObject, initialValue, structured, detectType } =
    useObjectFlatten<T>(object, nullFallback);

  interface SpanRefs {
    [key: string]: {
      spanRef: HTMLSpanElement | null;
    };
  }
  const spanRefs = useRef<SpanRefs>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [currentEdit, setCurrentEdit] = useState<string | null>(null);
  const handleOutsideClick = useCallback(() => {
    if (typeErrors && initialValue.current) {
      const key = typeErrors.key;
      const clone = { ...flattenObject };
      clone[key] = {
        ...clone[key],
        __value: initialValue.current[key].__value,
      };
      const s = structured(clone);
      onChange(s);
      setTypeErrors(null);
    }
    setCurrentEdit(null);
  }, [flattenObject, initialValue, onChange, structured, typeErrors]);
  useKey("Tab", (event) => {
    if (document !== undefined) {
      event.preventDefault();
      if (inputRef.current === document.activeElement) {
        const keys = Object.keys(flattenObject);
        const editableKeys = keys.filter(
          (key) => flattenObject[key].__editable
        );
        const currentIndex = editableKeys.findIndex(
          (key) => key === inputRef.current?.id
        );
        if (currentIndex !== -1) {
          if (currentIndex !== editableKeys.length - 1) {
            setCurrentEdit(editableKeys[currentIndex + 1]);
            console.log(flattenObject[editableKeys[currentIndex + 1]].__value);
            if (
              flattenObject[editableKeys[currentIndex + 1]].__value === null
            ) {
              handleEdit(editableKeys[currentIndex + 1], null);
            }
          } else {
            setCurrentEdit(editableKeys[0]);
          }
        }
      }
    }
  });
  useKey("Enter", () => {
    if (document !== undefined) {
      if (inputRef.current === document.activeElement) {
        setCurrentEdit(null);
      }
    }
  });
  useOutsideClick(inputRef, handleOutsideClick);
  useEffect(() => {
    if (currentEdit) {
      const spanRef = spanRefs.current[currentEdit].spanRef;
      if (!spanRef || !inputRef.current) return;
      const { width } = spanRef.getBoundingClientRect();
      inputRef.current.style.width = `${width || 1}px`;
      inputRef.current.focus();
    }
  }, [currentEdit, object]);
  const handleChange = useCallback(
    (key: string, value: string) => {
      if (!initialValue.current) return;
      const clone = { ...flattenObject };
      let newValue = value;
      const expectedType = initialValue.current[key].__type;
      if ((!changeType && expectedType !== "string") || convertTextToNumber) {
        try {
          const jsonValue = JSON.parse(value);
          newValue = jsonValue;
        } catch (e) {
          // nothing
        }
      }
      if (!changeType) {
        const currentType = detectType(newValue);
        if (expectedType !== currentType) {
          setTypeErrors({ key, expectedType, currentType });
        } else {
          setTypeErrors(null);
        }
      }
      clone[key] = { ...clone[key], __value: newValue };
      const s = structured(clone);
      onChange(s);
    },
    [
      changeType,
      convertTextToNumber,
      detectType,
      flattenObject,
      initialValue,
      onChange,
      structured,
    ]
  );
  const handleEdit = useCallback(
    (key: string, value: JsonValues) => {
      if (value === null) {
        if (nullFallback !== null && initialValue.current) {
          initialValue.current[key] = {
            __value: nullFallback,
            __type: detectType(nullFallback),
          };
          const clone = { ...flattenObject };
          clone[key] = { ...clone[key], __value: nullFallback };
          const s = structured(clone);
          onChange(s);
          setCurrentEdit(key);
        }
      } else {
        setCurrentEdit(key);
      }
    },
    [
      detectType,
      flattenObject,
      initialValue,
      nullFallback,
      onChange,
      structured,
    ]
  );
  const keyValueMarkup = (
    key: string,
    value: unknown,
    depth: number
  ): ReactNode => {
    if (isObject(value)) {
      return (
        <Fragment key={key}>
          <span className={styles.key}>
            {indentMarkup(depth)}"{key.split(".").slice(-1)[0]}"
          </span>
          <span className={styles.symbol}>:</span>
          <span className={styles.symbol}>{" {"}</span>
          <br></br>
          {Object.entries(value).map(([k, v]) =>
            keyValueMarkup(`${key}${"."}${k}`, v, depth + 1)
          )}
          <span className={styles.symbol}>
            {indentMarkup(depth)}
            {"}"}
          </span>
          <br></br>
        </Fragment>
      );
    }
    return (
      <Fragment key={key}>
        <span className={styles.key}>
          {indentMarkup(depth)}"{key.split(".").slice(-1)[0]}"
        </span>
        <span className={styles.symbol}>{": "}</span>
        {flattenObject[key].__type === "string" && (
          <span
            className={styles.symbol}
            onClick={() => handleEdit(key, flattenObject[key].__value)}
          >
            "
          </span>
        )}
        <span
          className={`${styles.symbol} ${
            styles[`type-${flattenObject[key].__type}`]
          }`}
          style={{
            position: currentEdit === key ? "absolute" : "relative",
            visibility: currentEdit === key ? "hidden" : "visible",
          }}
          ref={(ref) =>
            (spanRefs.current[key] = {
              ...spanRefs.current[key],
              spanRef: ref,
            })
          }
          onClick={() => handleEdit(key, flattenObject[key].__value)}
        >
          {flattenObject[key].__value !== null
            ? flattenObject[key].__value!.toString()
            : "null"}
        </span>
        {currentEdit === key && (
          <input
            data-tooltip-id={key}
            id={key}
            ref={(ref) => (inputRef.current = ref)}
            value={
              flattenObject[key].__type !== "null"
                ? flattenObject[key].__value!.toString()
                : "null"
            }
            className={`${styles.input}`}
            style={{
              textDecoration: typeErrors?.key === key ? "underline" : "none",
            }}
            type={"text"}
            autoComplete={"off"}
            autoCapitalize={"off"}
            onChange={(e) => handleChange(key, e.target.value)}
          ></input>
          <Tooltip.Trigger asChild>
            <input
              data-tooltip-id={key}
              ref={(ref) => (inputRef.current = ref)}
              value={
                flattenObject[key].__type !== "null"
                  ? flattenObject[key].__value!.toString()
                  : "null"
              }
              className={`${styles.input}`}
              style={{
                textDecoration: typeErrors?.key === key ? "underline" : "none",
              }}
              type={"text"}
              autoComplete={"off"}
              autoCapitalize={"off"}
              onChange={(e) => handleChange(key, e.target.value)}
            ></input>
          </Tooltip.Trigger>
        )}
        {flattenObject[key].__type === "string" && (
          <span
            className={styles.symbol}
            onClick={() => handleEdit(key, flattenObject[key].__value)}
          >
            "
          </span>
        )}
        <span className={styles.symbol}>,</span>
        <br></br>
      </Fragment>
    );
  };
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={100} disableHoverableContent>
        <code className={styles.code} data-gutter={dataGutter}>
          <span className={styles.symbol}>{"{"}</span>
          <br></br>
          {Object.entries(object).map(([k, v]) => keyValueMarkup(k, v, 1))}
          <span className={styles.symbol}>{"}"}</span>
        </code>
        {typeErrors && (
          <Tooltip.Content className={styles.TooltipContent} side={"bottom"}>
            {errorMessage
              ? errorMessage(typeErrors.expectedType, typeErrors.currentType)
              : `Expected ${typeErrors.expectedType}, but the value is ${typeErrors.currentType}.`}
          </Tooltip.Content>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
