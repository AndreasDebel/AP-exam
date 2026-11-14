CREATE TABLE section (
     id       int PRIMARY KEY,
     capacity int NOT NULL,
     sold     int NOT NULL DEFAULT 0
);

INSERT INTO section (id, capacity) VALUES
    (1, 100),
    (2, 1000000),
    (3, 1000000),
    (4, 1000000);

-- opret: docker exec -i booking-db psql -U postgres -d booking < api/schema.sql