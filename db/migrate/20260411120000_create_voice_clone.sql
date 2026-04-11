CREATE TABLE IF NOT EXISTS voice_clones (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  is_cloned INTEGER NOT NULL DEFAULT 0,
  cloned_at INTEGER,
  file_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_voice_clones_is_cloned ON voice_clones(is_cloned);
CREATE INDEX IF NOT EXISTS idx_voice_clones_created_at ON voice_clones(created_at);
