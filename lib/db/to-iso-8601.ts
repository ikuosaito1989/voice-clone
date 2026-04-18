function normalizeTimestampValue(value: Date | number | string) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    const timestamp =
      Math.abs(value) < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(timestamp);
  }

  return new Date(value);
}

export function toIso8601(value: Date | number | string | null | undefined) {
  if (value == null) {
    return null;
  }

  return normalizeTimestampValue(value).toISOString();
}
