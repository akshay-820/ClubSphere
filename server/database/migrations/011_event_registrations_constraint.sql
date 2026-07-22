ALTER TABLE event_registrations
ADD CONSTRAINT unique_user_event
UNIQUE (user_id, event_id);