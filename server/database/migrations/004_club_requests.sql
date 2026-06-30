CREATE TABLE club_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'cultural', 'sports', 'literary', 'other')),
    logo_url VARCHAR(255),
    membership_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_club_requests_college_id
ON club_requests(college_id);

CREATE INDEX idx_club_requests_requested_by
ON club_requests(requested_by);