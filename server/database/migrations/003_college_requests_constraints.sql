ALTER TABLE college_requests
DROP CONSTRAINT IF EXISTS college_requests_email_domain_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_college_requests_pending_email_domain
ON college_requests(email_domain);

CREATE INDEX IF NOT EXISTS idx_college_requests_requested_by
ON college_requests(requested_by);
