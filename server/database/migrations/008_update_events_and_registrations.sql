ALTER TABLE events 
ADD column status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
CHECK (status IN ('scheduled','cancelled','completed'));

ALTER TABLE event_registrations
DROP COLUMN status;