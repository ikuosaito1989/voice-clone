export function sanitizeFileName(fileName: string, fallback: string) {
  const trimmed = fileName.trim().toLowerCase();
  const normalized = trimmed.replace(/[^a-z0-9._-]+/g, "-");
  const collapsed = normalized.replace(/-+/g, "-");
  const withoutEdges = collapsed.replace(/^-|-$/g, "");

  return withoutEdges || fallback;
}
