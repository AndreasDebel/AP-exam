CREATE TABLE section (
     id       int PRIMARY KEY,
     capacity int NOT NULL,
     sold     int NOT NULL DEFAULT 0,
     disabled boolean NOT NULL DEFAULT false
);

INSERT INTO section (id, capacity) VALUES
    (1, 100),
    (2, 1000000),
    (3, 1000000),
    (4, 1000000);

-- Load-test sections 101-140 (#30, docs/metrics/test-description.md). So many places that a speed run never sells out.
-- Only k8s routes them (api.yaml); appsettings.json does not, so the load test runs against Minikube only.
INSERT INTO section (id, capacity)
SELECT id, 1000000 FROM generate_series(101, 140) AS id;

-- opret: docker exec -i booking-db psql -U postgres -d booking < api/schema.sql