CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Use ENUMs instead of regular TEXT
-- CREATE TYPE contact_type AS ENUM ('EMAIL', 'PHONE');
-- CREATE TYPE club_role AS ENUM ('ADMIN')

CREATE TABLE users (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  usn VARCHAR(15) NOT NULL UNIQUE,
  pfp TEXT,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
  role TEXT NOT NULL,
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_team_members
    PRIMARY KEY (team_id, user_id),
  CONSTRAINT fk_team_member_team
    FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT fk_team_member_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE clubs (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE club_members (
  role TEXT NOT NULL,
  club_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_club_members
    PRIMARY KEY (club_id, user_id),
  CONSTRAINT fk_club_member_club
    FOREIGN KEY (club_id) REFERENCES clubs(id),
  CONSTRAINT fk_club_member_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  art TEXT,
  min_team_size SMALLINT NOT NULL,
  max_team_size SMALLINT NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  club_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_club
    FOREIGN KEY (club_id) REFERENCES clubs(id),
  CONSTRAINT chk_team_size
    CHECK (
      min_team_size >= 1 AND
      min_team_size <= max_team_size
    ),
  CONSTRAINT chk_event_time
    CHECK (
      registration_deadline <= starts_at AND
      starts_at < ends_at
    )
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  event_id UUID,
  club_id UUID,
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_event
    FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_contact_club
    FOREIGN KEY (club_id) REFERENCES clubs(id),
  CONSTRAINT chk_contact_owner
    CHECK (
      (event_id IS NOT NULL AND club_id IS NULL) OR
      (event_id IS NULL AND club_id IS NOT NULL)
    )
);

CREATE TABLE links (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  event_id UUID,
  club_id UUID,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_link_event
    FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_link_club
    FOREIGN KEY (club_id) REFERENCES clubs(id),
  CONSTRAINT chk_link_owner
    CHECK (
      (event_id IS NOT NULL AND club_id IS NULL) OR
      (event_id IS NULL AND club_id IS NOT NULL)
    )
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(), -- Surrogate key
  event_id UUID NOT NULL,
  user_id UUID,
  team_id UUID,
  mode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registration_event
    FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_registration_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_registration_team
    FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT chk_registration_owner
  CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX uq_registration_user
ON registrations(event_id, user_id)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX uq_registration_team
ON registrations(event_id, team_id)
WHERE team_id IS NOT NULL;

CREATE TABLE attendances (
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_attendances
    PRIMARY KEY (event_id, user_id),
  CONSTRAINT fk_attendance_event
    FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_attendance_user
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Enfore limits for better UX without changing schema
-- CONSTRAINT chk_event_name_length
-- CHECK (char_length(name) <= 100)