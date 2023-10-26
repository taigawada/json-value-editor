export const isObject = (
  value: unknown
): value is { [key: string]: string } => {
  return Object.prototype.toString.call(value) === "[object Object]";
};
