CREATE UNIQUE INDEX memberships_one_president_per_club
ON memberships (club_id)
WHERE role = 'president';