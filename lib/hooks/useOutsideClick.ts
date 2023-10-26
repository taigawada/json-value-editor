import { RefObject, useCallback, useEffect } from "react";

export const useOutsideClick = <T extends HTMLElement = HTMLElement>(
  target: RefObject<T>,
  callback: (event: Event) => void
) => {
  const clickHandler = useCallback(
    (event: Event) => {
      const element = target.current;
      if (element && !element.contains(event.target as Node)) {
        callback(event);
      }
    },
    [target, callback]
  );
  useEffect(() => {
    addEventListener("mousedown", clickHandler);
    return () => {
      removeEventListener("mousedown", clickHandler);
    };
  }, [clickHandler]);
};
