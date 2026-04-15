ALTER TABLE voice_clones RENAME COLUMN file_name TO reference_audio_path;

ALTER TABLE voice_clones ADD COLUMN cloned_audio_path TEXT;
