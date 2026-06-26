CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--Colleges table to store information about colleges
CREATE TABLE colleges (
    id UUID primary key default gen_random_uuid(),
    name varchar(100) not null,
    email_domain varchar(100) not null unique,
    logo_url varchar(255) not null
);

--Users table to store information about users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL unique,
    year INTEGER CHECK (year >= 1 AND year <= 5),
    branch VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    college_id UUID references colleges(id) ON DELETE SET NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'college_admin', 'super_admin')),

    email_verified BOOLEAN DEFAULT false
);

--Clubs table to store information about clubs
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'cultural', 'sports', 'literary', 'other')),
    logo_url VARCHAR(255),
    slug VARCHAR(120) NOT NULL UNIQUE,

    membership_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    accepting_members BOOLEAN DEFAULT false,
    registration_type VARCHAR(20) NOT NULL DEFAULT 'both'
    CHECK (registration_type IN ('paid', 'recruiting', 'both')),
    membership_duration_days INTEGER NOT NULL DEFAULT 365
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,

    amount NUMERIC(10, 2) NOT NULL,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('membership_fee', 'event_fee')),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),

    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- M-M(user, club) relationship table to store information about memberships
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    joined_at DATE NOT NULL,
    ends_at DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'revoked')),
    role VARCHAR(20) NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'admin', 'president')),
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, club_id)
);

-- one to many relationship between clubs and events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    banner_url VARCHAR(255),

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),

    max_participants INTEGER CHECK (max_participants > 0),
    registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    open_to_all_colleges BOOLEAN NOT NULL DEFAULT false
);

--many to many relationship between users and events
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'cancelled', 'attended')),
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    UNIQUE(user_id, event_id)
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('announcement', 'recruitment', 'general')),

    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    media_urls TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

--for the super admin to approve or reject college requests
CREATE TABLE college_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_name VARCHAR(100) NOT NULL,
    email_domain VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(255) NOT NULL,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- USERS
CREATE INDEX idx_users_college_id ON users(college_id);

CREATE INDEX idx_users_role ON users(role);

-- CLUBS
CREATE INDEX idx_clubs_college_id ON clubs(college_id);

CREATE INDEX idx_clubs_category ON clubs(category);

CREATE INDEX idx_clubs_accepting_members ON clubs(accepting_members);

-- MEMBERSHIPS
CREATE INDEX idx_memberships_user_id ON memberships(user_id);

CREATE INDEX idx_memberships_club_id ON memberships(club_id);

CREATE INDEX idx_memberships_status ON memberships(status);

-- PAYMENTS
CREATE INDEX idx_payments_user_id ON payments(user_id);

CREATE INDEX idx_payments_club_id ON payments(club_id);

CREATE INDEX idx_payments_status ON payments(status);

-- EVENTS
CREATE INDEX idx_events_club_id ON events(club_id);

CREATE INDEX idx_events_start_time ON events(start_time);

-- EVENT REGISTRATIONS
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);

-- POSTS
CREATE INDEX idx_posts_club_id ON posts(club_id);

CREATE INDEX idx_posts_created_at ON posts(created_at);

-- NOTIFICATIONS
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

CREATE INDEX idx_notifications_is_read ON notifications(is_read);