// Rejection reasons and user context may contain cycles or bigint values.
export function stringify(value: unknown): string {
  const ancestors: object[] = [];
  return (
    JSON.stringify(value, function (this: unknown, _key, item: unknown) {
      if (typeof item === "bigint") return String(item);
      if (item !== null && typeof item === "object") {
        while (ancestors.length > 0 && ancestors.at(-1) !== this)
          ancestors.pop();
        if (ancestors.includes(item)) return "[Circular]";
        ancestors.push(item);
      }
      return item;
    }) ?? String(value)
  );
}
