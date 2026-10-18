CREATE TABLE feedback_admin_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  secret_version TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX feedback_admin_sessions_expiry ON feedback_admin_sessions(expires_at);
