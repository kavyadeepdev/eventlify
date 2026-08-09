ALTER TABLE users
ADD CONSTRAINT uq_users_slug UNIQUE (slug);

ALTER TABLE clubs
ADD CONSTRAINT uq_clubs_slug UNIQUE (slug);

ALTER TABLE events
ADD CONSTRAINT uq_events_slug UNIQUE (slug);