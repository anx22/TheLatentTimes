
-- 1. CONTROL TABLE: The "Switch" and "Status Monitor"
-- This table holds the singleton state of the autopilot
CREATE TABLE IF NOT EXISTS modus_ops (
    key TEXT PRIMARY KEY DEFAULT 'global',
    status TEXT DEFAULT 'IDLE', -- 'IDLE', 'RUNNING', 'PAUSED', 'ERROR'
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    current_task TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    error_log TEXT
);

-- Initialize the global row if it doesn't exist
INSERT INTO modus_ops (key, status, current_task) 
VALUES ('global', 'IDLE', 'System Ready')
ON CONFLICT (key) DO NOTHING;

-- 2. LOGS TABLE: Ensure it exists and is robust
CREATE TABLE IF NOT EXISTS modus_logs (
    id TEXT PRIMARY KEY,
    entries JSONB, -- Array of log objects
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REALTIME: Enable listening to these tables
-- Turn on Realtime for the Ops table so the UI updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE modus_ops;
ALTER PUBLICATION supabase_realtime ADD TABLE modus_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE modus_issues;

-- 4. CRON: (Optional) Schedule the heartbeat
-- Requires the pg_cron extension to be enabled in Supabase Dashboard
-- SELECT cron.schedule('autopilot-heartbeat', '*/10 * * * *', $$
--     SELECT net.http_post(
--         url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/autopilot',
--         headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--         body:='{}'::jsonb
--     ) as request_id;
-- $$);
