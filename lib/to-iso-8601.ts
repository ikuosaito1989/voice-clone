export function toIso8601(value: Date | null) {
  return value ? value.toISOString() : null;
}
